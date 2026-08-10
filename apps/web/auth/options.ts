import { NextAuthOptions } from "next-auth";
import { authConfig } from "./config";

export const callbacks: NextAuthOptions["callbacks"] = {
    async signIn({ user, account }) {
        if (account?.provider === "credentials") {
            return true;
        }
        
        // Google OAuth is temporarily disabled until it's migrated to the REST API
        if (account?.provider === "google") {
            console.warn("Google sign-in is pending REST API migration.");
            return false;
        }

        return false;
    },
    async jwt({ token, user, trigger }) {
        // Handle initial sign in
        if (trigger === 'signIn' && user) {
            token.id = user.id;
            token.email = user.email;
            token.name = user.name;
            token.role = (user as any).role || '';
            const image = (user as any).image;
            token.image = (typeof image === 'string' && image.startsWith('data:')) ? null : image;
            
            // Capture the backend's JWT token
            token.api_token = (user as any).api_token;

            // Assume the REST API returns organization_profile on login if applicable
            token.organization_profile = (user as any).organization_profile;
        }

        // Token refresh from DB is disabled. The web app should fetch updated profile data via REST API if needed.
        return token;
    },
    async session({ session, token }) {
        if (!token) {
            return {
                ...session,
                user: { id: '', email: '', name: '', role: '' },
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
                api_token: token.api_token, // Expose API token to the client
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
