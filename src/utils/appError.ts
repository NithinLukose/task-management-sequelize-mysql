import { ValidationError } from "express-validator";

export class AppError extends Error {
  public statusCode;
  public status;
  public errors;
  constructor(statusCode: number, message: string, errors?: ValidationError[]) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errors = errors;
  }
}
