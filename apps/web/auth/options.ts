import { NextAuthOptions } from "next-auth";
import User from "@/server/db/models/user";
import connectToDatabase from "@/server/config/mongoose";
import { authConfig } from "./config";

export const callbacks: NextAuthOptions["callbacks"] = {
    async signIn({ user, account }) {
        await connectToDatabase();

        if (account?.provider === "google") {
            try {
                const existingUser = await User.findOne({ email: user.email }).lean();

                if (!existingUser) {
                    const newUser = new User({
                        email: user.email,
                        name: user.name,
                        provider: "google",
                        is_verified: true,
                    });
                    await newUser.save();
                    return true;
                }

                return true;
            } catch (err) {
                console.error("Error during Google sign-in:", err);
                return false;
            }
        }

        if (account?.provider === "credentials") {
            return true;
        }

        return false;
    },
    async jwt({ token, user, trigger }) {
        const now = Math.floor(Date.now() / 1000);

        // Handle initial sign in
        if (trigger === 'signIn' && user) {
            token.id = user.id;
            token.email = user.email;
            token.name = user.name;
            token.role = (user as any).role || '';
            // Avoid adding large base64 images to the JWT to prevent ERR_RESPONSE_HEADERS_TOO_BIG
            const image = (user as any).image;
            token.image = (typeof image === 'string' && image.startsWith('data:')) ? null : image;
            token.lastRefreshed = now;
        }

        // Only fetch from database if we have an email and:
        // 1. It's a sign-in (to get full profile info)
        // 2. Client called update() (e.g. after profile picture change) so we refetch latest user
        // 3. We haven't refreshed in the last 60 seconds
        const shouldRefresh = trigger === 'signIn' || trigger === 'update' || !token.lastRefreshed || (now - (token.lastRefreshed as number) > 60);

        if (token.email && shouldRefresh) {
            try {
                await connectToDatabase();

                const retrievedUser = await User.findOne({ email: token.email })
                    .populate("organization_profile")
                    .maxTimeMS(5000)
                    .lean() as any;

                if (retrievedUser) {
                    token.id = retrievedUser._id.toString();
                    token.email = retrievedUser.email;
                    token.name = retrievedUser.name;
                    token.role = retrievedUser.role || '';
                    // Avoid adding large base64 images to the JWT to prevent ERR_RESPONSE_HEADERS_TOO_BIG
                    const image = retrievedUser.image;
                    token.image = (typeof image === 'string' && image.startsWith('data:')) ? null : image;
                    token.organization_profile = (retrievedUser.organization_profile && typeof retrievedUser.organization_profile === 'object') ? {
                        _id: retrievedUser.organization_profile._id?.toString() || retrievedUser.organization_profile.toString(),
                        title: retrievedUser.organization_profile.title || 'Organisation',
                    } : undefined;
                    token.lastRefreshed = now;

                    // Update last_seen timestamp (only when we refresh the token data)
                    User.findByIdAndUpdate(retrievedUser._id, { last_seen: new Date() }).exec().catch(() => { });
                } else if (trigger !== 'signIn') {
                    // If user not found in DB but token exists, clear sensitive parts of token
                    // This helps the frontend detect that the session is stale
                    console.warn(`User with email ${token.email} not found in database. Clearing token.`);
                    token.id = '';
                    token.email = '';
                    token.name = '';
                    token.role = '';
                    token.image = undefined;
                    token.organization_profile = undefined;
                }
            } catch (error) {
                console.error('Error fetching user data in JWT callback:', error);
                // On connection error, keep the token but log the error
            }
        }

        return token;
    },
    async session({ session, token }) {
        if (!token) {
            return {
                ...session,
                user: {
                    id: '',
                    email: '',
                    name: '',
                    role: '',
                },
            };
        }

        return {
            ...session,
            user: {
                ...session.user,
                id: typeof token.id === 'string' ? token.id : '',
                email: typeof token.email === 'string' ? token.email : '',
                name: typeof token.name === 'string' ? token.name : '',
                role: typeof token.role === 'string' ? token.role : '',
                image: typeof token.image === 'string' ? token.image : null,
                organization_profile: token.organization_profile,
            } as any,
        };
    },
};

export const authOptions: NextAuthOptions = {
    providers: authConfig.providers!,
    secret: authConfig.secret,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: "/login",
    },
    callbacks,
};
