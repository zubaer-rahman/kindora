const VERIFY_EMAIL_TEMPLATE = ""; const MENTOR_INVITATION_TEMPLATE = ""; const RECRUITMENT_CONFIRMATION_TEMPLATE = ""; const APPLICATION_CONFIRMATION_TEMPLATE = "";
const sendEmail = async () => { console.warn("sendEmail mocked during migration"); };
import Opportunity from "@/server/db/models/opportunity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendApplicationConfirmationMail = async (
  email: string,
  name: string,
  opportunityId: string
) => {
  try {
    // Fetch opportunity details
    const opportunity = await Opportunity.findById(opportunityId)
      .populate({
        path: 'organization_profile',
        select: 'title'
      });

    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    const organizationName = opportunity.organization_profile?.title || "Organization";
    const opportunityTitle = opportunity.name || "Opportunity";

    const appUrl = process.env.CLIENT_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const logoUrl = `${appUrl}/KINDORA.svg`;
    const supportUrl = process.env.SUPPORT_URL || appUrl;

    const emailTemplate = APPLICATION_CONFIRMATION_TEMPLATE;
    sendEmail(
      [email],
      {
        subject: "Confirmation: Your Opportunity Application - Kindora",
        data: {
          userName: name,
          opportunity: opportunityTitle,
          organization: organizationName,
          logoUrl,
          supportUrl,
        },
      },
      emailTemplate
    );
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
};
