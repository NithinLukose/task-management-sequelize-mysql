import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { User } from "../models/userModel";
import { Task } from "../models/taskModel";
import { AppError } from "../utils/appError";

export const getUserDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.params.id, 10);
    const userDetails = await User.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          model: Task,
          as: "assignedTasks",
        },
        {
          model: Task,
          as: "createdTasks",
        },
      ],
    });
    if (!userDetails) {
      return next(new AppError(404, "User not found"));
    }
    res.status(200).json({
      status: "success",
      data: {
        userDetails,
      },
    });
  }
);
