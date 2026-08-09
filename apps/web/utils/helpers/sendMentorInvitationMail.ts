const VERIFY_EMAIL_TEMPLATE = ""; const MENTOR_INVITATION_TEMPLATE = ""; const RECRUITMENT_CONFIRMATION_TEMPLATE = ""; const APPLICATION_CONFIRMATION_TEMPLATE = "";
const sendEmail = async () => { console.warn("sendEmail mocked during migration"); };
import OrganizationProfile from "@/server/db/models/organization-profile";

export const sendMentorInvitationMail = async (
  email: string,
  name: string,
  organizationId: string,
  token: string
) => {
  try {
    // Fetch organization details
    const organization = await OrganizationProfile.findById(organizationId);

    if (!organization) {
      throw new Error("Organisation not found");
    }

    const organizationName = organization.title || "Organisation";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL || "http://localhost:3000";
    const logoUrl = `${baseUrl}/KINDORA.svg`;
    const supportUrl = process.env.SUPPORT_URL || baseUrl;

    const emailTemplate = MENTOR_INVITATION_TEMPLATE;
    sendEmail(
      [email],
      {
        subject: `Mentor Invitation from ${organizationName} - Kindora`,
        data: {
          userName: name,
          organizationName,
          token,
          baseUrl,
          logoUrl,
          supportUrl,
        },
      },
      emailTemplate
    );
  } catch (error) {
    console.error("Error sending mentor invitation email:", error);
    throw new Error("Failed to send invitation email. Please try again later.");
  }
}; 