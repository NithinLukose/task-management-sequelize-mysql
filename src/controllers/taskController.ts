import { Request, Response, NextFunction } from "express";
import { Task } from "../models/taskModel";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { Op } from "sequelize";
import { UserAttributes } from "../models/userModel";
import { body, validationResult } from "express-validator";

export const validateTask = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .escape(),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .escape(),
  body("status")
    .optional()
    .isIn(["Open", "In Progress", "Completed", "Blocked"])
    .withMessage(
      "status must be one of: 'Open', 'In Progress', 'Completed', 'Blocked'"
    ),
  body("dueDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Due date must be a valid date"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be one of: low, medium, high"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(400, "invalid data", errors.array()));
    }
    next();
  },
];

export const createTask = catchAsync(
  async (req: Request & { user: UserAttributes }, res: Response) => {
    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;
    const createdBy = req.user.id;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy,
    });

    res.status(201).json({
      status: "success",
      data: {
        task,
      },
    });
  }
);

interface TaskQueryParams {
  search?: string;
  page?: string; // query params are always strings
  limit?: string;
}

export const getAllTasks = catchAsync(
  async (req: Request<{}, {}, {}, TaskQueryParams>, res: Response) => {
    const page = parseInt(req.query.page ?? "1");
    const limit = parseInt(req.query.limit ?? "10");
    const search = req.query.search ?? "";
    const offset = (page - 1) * limit;
    const tasks = await Task.findAll({
      limit,
      offset,
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            description: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        tasks,
      },
    });
  }
);

export const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  const task = await Task.findByPk(taskId);
  if (task) {
    res.status(200).json({
      status: "success",
      data: {
        task,
      },
    });
  }
});

export const updateTaskById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await Task.findByPk(taskId);
    if (task) {
      await task.update(req.body);
      res.status(200).json({
        status: "success",
        data: {
          task,
        },
      });
    } else {
      return next(new AppError(404, "Task not found"));
    }
  }
);

export const deletePostByID = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await Task.findByPk(taskId);
    if (task) {
      await task.destroy(req.body);
      res.status(204).send();
    } else {
      return next(new AppError(404, "Task not found"));
    }
  }
);
