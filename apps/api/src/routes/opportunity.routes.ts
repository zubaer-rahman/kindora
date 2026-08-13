import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { allowRoles } from "../middleware/role-guard";
import { UserRole } from "../db/interfaces/user";
import {
  createOpportunity,
  getAllOpportunities,
  getAllOpportunitiesCount,
  getOpportunity,
  updateOpportunity,
  archiveOpportunity,
  unarchiveOpportunity,
  deleteOpportunity,
  getOrganizationOpportunities,
  getMentorOpportunities,
  getMentorOpportunitiesCount,
  getMentorOpportunitiesAll,
  getPublicOpportunities,
  getPublicOpportunity,
  getPublicOpportunitiesByMentor,
} from "../controllers/opportunity.controller";

const router = Router();

router.get("/public", getPublicOpportunities);
router.get("/public/by-mentor/:userId", getPublicOpportunitiesByMentor);
router.get("/public/:id", getPublicOpportunity);

router.use(requireAuth);

router.get("/count", getAllOpportunitiesCount);
router.get("/my-org", getOrganizationOpportunities);
router.get("/mentor/count", getMentorOpportunitiesCount);
router.get("/mentor/all", getMentorOpportunitiesAll);
router.get("/mentor", getMentorOpportunities);

router.get("/", getAllOpportunities);
router.post("/", allowRoles(UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.MENTOR), createOpportunity);

router.get("/:id", getOpportunity);
router.put("/:id", allowRoles(UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.MENTOR), updateOpportunity);
router.delete("/:id", allowRoles(UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.MENTOR), deleteOpportunity);

router.patch("/:id/archive", allowRoles(UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.MENTOR), archiveOpportunity);
router.patch("/:id/unarchive", allowRoles(UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.MENTOR), unarchiveOpportunity);

export default router;
