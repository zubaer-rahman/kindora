import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);

// TODO: Add remaining routes as controllers are migrated:
// router.use('/users', userRoutes);
// router.use('/opportunities', opportunityRoutes);
// router.use('/volunteer-profiles', volunteerProfileRoutes);
// router.use('/mentor-profiles', mentorProfileRoutes);
// router.use('/organization-profiles', organizationProfileRoutes);
// router.use('/applications', applicationRoutes);
// router.use('/messages', messageRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/skills', skillsRoutes);
// router.use('/upload', uploadRoutes);

export default router;
