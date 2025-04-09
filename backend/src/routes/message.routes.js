import { Router } from "express";
import { restrictedRoutes } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.get("/users", restrictedRoutes, getUsersForSidebar);
router.get("/:id", restrictedRoutes, getMessages);

router.post("/send/:id", restrictedRoutes, sendMessage);

export default router;