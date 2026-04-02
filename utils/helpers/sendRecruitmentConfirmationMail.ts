import { RECRUITMENT_CONFIRMATION_TEMPLATE } from "@/server/services/mail/constants";
import sendEmail from "@/server/services/mail/sendMail";
import VolunteerApplication from "@/server/db/models/volunteer-application";
 

export const sendRecruitmentConfirmationMail = async (
  applicationId: string
) => {
  try {
    // Fetch application details with populated fields
    const application = await VolunteerApplication.findById(applicationId)
      .populate({
        path: 'volunteer',
        select: 'email name'
      })
      .populate({
        path: 'opportunity',
        select: 'title',
        populate: {
          path: 'organization_profile',
          select: 'title'
        }
      });

    if (!application) {
      throw new Error("Application not found");
    }

    const volunteer = application.volunteer as { email: string; name: string };
    const opportunity = application.opportunity as { 
      title: string;
      organization_profile: { title: string };
    };

    if (!volunteer?.email || !volunteer?.name) {
      throw new Error("Volunteer details not found");
    }

    const organizationName = opportunity?.organization_profile?.title || "Organization";
    const opportunityTitle = opportunity?.title || "Opportunity";

    const appUrl = process.env.CLIENT_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const logoUrl = `${appUrl}/KINDORA.svg`;
    const supportUrl = process.env.SUPPORT_URL || appUrl;

    const emailTemplate = RECRUITMENT_CONFIRMATION_TEMPLATE;
    sendEmail(
      [volunteer.email],
      {
        subject: "Congratulations! You've Been Recruited - Kindora",
        data: {
          userName: volunteer.name,
          opportunity: opportunityTitle,
          organization: organizationName,
          logoUrl,
          supportUrl,
        },
      },
      emailTemplate
    );
  } catch (error) {
    console.error("Error sending recruitment confirmation email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
}; 