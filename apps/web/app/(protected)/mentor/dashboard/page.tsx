import MentorDashboard from "@/components/layout/mentor/dashboard";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

export default function MentorDashboardPage() {
    return (
        <ProtectedLayout>
            <MentorDashboard />
        </ProtectedLayout>
    );
}
