import express from "express";
import { protect } from "../controllers/authController";
import { getUserDetails } from "../controllers/userController";

const router = express.Router();

router.route("/:id").get(protect, getUserDetails);

export default router;
