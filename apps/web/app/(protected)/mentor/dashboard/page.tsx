import MentorDashboard from "@/components/features/mentor/dashboard/MentorDashboard";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

export default function MentorDashboardPage() {
    return (
        <ProtectedLayout>
            <MentorDashboard />
        </ProtectedLayout>
    );
}
