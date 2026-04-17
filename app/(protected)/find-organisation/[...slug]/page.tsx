import FindOrganisation from "@/components/layout/find-organisation";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

const FindOrganisationPage = () => {
    return (
        <ProtectedLayout>
            <FindOrganisation />
        </ProtectedLayout>
    );
};
export default FindOrganisationPage;
