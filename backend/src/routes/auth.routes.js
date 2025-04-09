import { Router } from "express";
import { login, logout, signup, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { restrictedRoutes } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.put("/update-profile", restrictedRoutes, updateProfile)
router.get("/check-auth", restrictedRoutes, checkAuth)

export default router