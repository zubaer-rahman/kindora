import { Router } from 'express';
import authRoutes from './auth.routes';
import opportunityRoutes from './opportunity.routes';
import volunteerApplicationRoutes from './volunteer-application.routes';
import userRoutes from './user.routes';
import volunteerProfileRoutes from './volunteer-profile.routes';
import organizationProfileRoutes from './organization-profile.routes';
import mentorProfileRoutes from './mentor-profile.routes';
import organisationRecruitmentRoutes from './organisation-recruitment.routes';
import organizationMentorsRoutes from './organization-mentors.routes';
import skillRoutes from './skill.routes';
import uploadRoutes from './upload.routes';
import notificationRoutes from './notification.routes';
import rosterRoutes from './roster.routes';
import feedbackRoutes from './feedback.routes';
import messageRoutes from './message.routes';
import sseRoutes from './sse.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/applications', volunteerApplicationRoutes);
router.use('/users', userRoutes);
router.use('/volunteer-profiles', volunteerProfileRoutes);
router.use('/organization-profiles', organizationProfileRoutes);
router.use('/mentor-profiles', mentorProfileRoutes);
router.use('/recruitments', organisationRecruitmentRoutes);
router.use('/organization-mentors', organizationMentorsRoutes);
router.use('/skills', skillRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/rosters', rosterRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/messages', messageRoutes);
router.use('/stream', sseRoutes);

export default router;
