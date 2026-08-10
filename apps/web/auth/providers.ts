import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fetchJson = async (path: string, body: Record<string, unknown>): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || "Request failed. Please try again.");
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
      try {
        const result = await fetchJson("/api/v1/auth/register", {
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
          role: credentials.role,
          referred_by: credentials.referred_by,
        });
        // We technically shouldn't return here if registration doesn't auto-login,
        // but if the API did return a user and token, we could pass it.
        // However, the backend explicitly throws a "Please check your email" error 
        // in auth.service.ts on successful registration, so this line is rarely reached.
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Registration failed. Please try again.";
        throw new Error(message);
      }
      // Registration succeeded but no session is created — the API signals this
      // by throwing a "Registration successful, please verify" error.
      throw new Error(
        "Registration successful. Please check your email to verify your account. You can sign in after verifying."
      );
    }

    throw new Error("Invalid action specified");
  },
});

export const GoogleProvider = Google({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});