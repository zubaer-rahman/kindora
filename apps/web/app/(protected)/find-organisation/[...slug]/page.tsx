import FindOrganisation from "@/components/features/organization/find-organization/FindOrganization";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

const FindOrganisationPage = () => {
    return (
        <ProtectedLayout>
            <FindOrganisation />
        </ProtectedLayout>
    );
};
export default FindOrganisationPage;
