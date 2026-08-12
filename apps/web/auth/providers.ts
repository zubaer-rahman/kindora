import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchJson = async (path: string, body: Record<string, unknown>): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    const error: any = new Error(data?.message || "Request failed. Please try again.");
    error.code = data?.code;
    throw error;
  }
  return data;
};

export const CredentialsProvider = Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
    action: { label: "Action", type: "text" },
    name: { label: "Name", type: "text" },
    referred_by: { label: "Referred By", type: "text" },
    role: { label: "Role", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Invalid credentials");
    }

    if (credentials?.action === "signin") {
      const result = await fetchJson("/api/v1/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });
      return { ...result.data.user, api_token: result.data.token };
    }

    if (credentials?.action === "signup") {
      const result = await fetchJson("/api/v1/auth/register", {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        role: credentials.role,
        referred_by: credentials.referred_by,
      });

      // Registration succeeded but the account still needs email verification,
      // so no session is created. Signal success via a structured error code.
      if (result?.data?.code === "SIGNUP_SUCCESS_UNVERIFIED") {
        const error: any = new Error(
          result.data.message ||
            "Registration successful. Please check your email to verify your account. You can sign in after verifying."
        );
        error.code = result.data.code;
        throw error;
      }

      // Registration returned credentials directly (auto-login signup)
      if (result?.data?.user && result?.data?.token) {
        return { ...result.data.user, api_token: result.data.token };
      }

      throw new Error("Account created. Please verify your email to continue.");
    }

    throw new Error("Invalid action specified");
  },
});

export const GoogleProvider = Google({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});