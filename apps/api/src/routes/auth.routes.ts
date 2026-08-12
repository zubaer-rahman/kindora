import { Router } from "express";
import { register, login, getMe, checkEmail } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/check-email", checkEmail);
router.get("/me", requireAuth, getMe);

export default router;
