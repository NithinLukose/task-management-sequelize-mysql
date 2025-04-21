import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode ?? 500;
  err.status = err.status ?? "error";
  err.message = err.message ?? "something went wrong";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errors: err.errors,
  });
};
