
import { Router } from "express";
import { realizarLogin } from "../controllers/authController";

const router = Router();

router.post("/login", realizarLogin);

export default router;
