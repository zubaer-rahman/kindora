import FindOpportunity from "@/components/features/volunteer/find-opportunity/FindOpportunity";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

const FindOpportunityPage = () => {
    return (
        <ProtectedLayout>
            <FindOpportunity />
        </ProtectedLayout>
    );
};
export default FindOpportunityPage;
