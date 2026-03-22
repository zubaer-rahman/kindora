// /server/router.ts
import { authRouter } from "@/server/modules/auth";
import { userRouter } from "@/server/modules/users";
import { volunteerProfileRouter } from "@/server/modules/volunteer-profile";
import { opportunityRouter } from "@/server/modules/opportunity";
import { router } from "./trpc";
import { uploadRouter } from "@/server/modules/upload";
import { organizationProfileRouter } from "@/server/modules/organization-profile";
import { volunteerApplicationRouter } from "@/server/modules/volunteer-application";
import { organisationRecruitmentRouter } from "@/server/modules/organisation-recruitment";
import { messageRouter } from "@/server/modules/message";
import { organizationMentorRouter } from "@/server/modules/organization-mentors";
import { notificationRouter } from "@/server/modules/notification";
import { skillsRouter } from "@/server/modules/skills";
import { feedbackRouter } from "@/server/modules/feedback";
import { mentorProfileRouter } from "@/server/modules/mentor-profile";
import { initializeCronJobs } from "./services/init-cron";
import { rosterRouter } from "@/server/modules/rosters";

// Initialize cron jobs when the module is loaded
if (process.env.NODE_ENV !== 'test') {
  initializeCronJobs();
}

export const appRouter = router({
  users: userRouter,
  auth: authRouter,
  volunteers: volunteerProfileRouter,
  mentorProfile: mentorProfileRouter,
  opportunities: opportunityRouter,
  upload: uploadRouter,
  organizations: organizationProfileRouter,
  organizationProfile: organizationProfileRouter, // for easier access
  applications: volunteerApplicationRouter,
  recruits: organisationRecruitmentRouter,
  messages: messageRouter,
  mentors: organizationMentorRouter,
  notifications: notificationRouter,
  skills: skillsRouter,
  feedback: feedbackRouter
  ,
  rosters: rosterRouter
});

export type AppRouter = typeof appRouter;
