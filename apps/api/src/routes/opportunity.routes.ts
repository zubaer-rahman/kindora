import { Router } from "express";
import { requireAuth } from "../middleware/auth";
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
router.post("/", createOpportunity);

router.get("/:id", getOpportunity);
router.put("/:id", updateOpportunity);
router.delete("/:id", deleteOpportunity);

router.patch("/:id/archive", archiveOpportunity);
router.patch("/:id/unarchive", unarchiveOpportunity);

export default router;
