"use client";

export type SignupRole = "volunteer" | "mentor" | "organization";

const ROLE_CONFIGS: Record<SignupRole, { title: string; description: string }> = {
    volunteer: {
        title: "Start Your Volunteer Journey",
        description: "Welcome to Kindora! Connect with causes you care about and start making an impact in your community today.",
    },
    mentor: {
        title: "Join Our Mentor Network",
        description: "Share your professional expertise and guidance. Help students and early-career professionals navigate their path to success.",
    },
    organization: {
        title: "Empower Your Organisation",
        description: "Find the right talent for your projects. Connect with skilled volunteers and mentors to drive your mission forward.",
    },
};

interface SignupHeaderProps {
    role: SignupRole;
}

export function SignupHeader({ role }: SignupHeaderProps) {
    const config = ROLE_CONFIGS[role];

    return (
        <div className="text-center sm:text-left space-y-3 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
                {config.title}
            </h2>
            <p className="text-sm text-gray-600">
                {config.description}
            </p>
        </div>
    );
}
