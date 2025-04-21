import express from "express";
import {
  createTask,
  deletePostByID,
  getAllTasks,
  getTaskById,
  updateTaskById,
  validateTask,
} from "../controllers/taskController";
import { protect } from "../controllers/authController";

const router = express.Router();

router
  .route("/")
  .post(protect, validateTask, createTask)
  .get(protect, getAllTasks);
router
  .route("/:id")
  .get(protect, getTaskById)
  .patch(protect, updateTaskById)
  .delete(protect, deletePostByID);

export default router;
