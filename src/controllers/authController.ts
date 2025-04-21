import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync";
import { User, UserAttributes } from "../models/userModel";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/appError";

const JWT_SECRET = "my-ultra-secure-and-ultra-long-secret";

const correctPassword = async (
  candidatePassword: string,
  userPassword: string
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const signToken = (id: number) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

const createSendToken = (
  user: UserAttributes,
  statusCode: number,
  res: Response
) => {
  const token = signToken(user.id);

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
  });
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: {
        username: user.username,
        id: user.id,
        email: user.email,
      },
    },
  });
};

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!email || !username || !password) {
      return next(new AppError(400, "Please provide the required fields"));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError(400, "Please provide the required fields"));
    }

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user || !correctPassword(password, user.password)) {
      return next(new AppError(401, "Invalid credentials"));
    }
    createSendToken(user, 200, res);
  }
);

export const protect = catchAsync(
  async (
    req: Request & { user: UserAttributes },
    res: Response,
    next: NextFunction
  ) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(new AppError(401, "Not Authorized"));
    }

    jwt.verify(token, JWT_SECRET, async (err, user: any) => {
      if (err) {
        return next(new AppError(403, "Forbidden: Invalid token"));
      }
      try {
        const existingUser = await User.findByPk(user.id);
        if (!existingUser) {
          return next(new AppError(401, "Unauthorized: Invalid user"));
        }

        req.user = user; // Attach the user object to the request
        next();
      } catch (err) {
        return next(new AppError(500, "Internal something went wrong"));
      }
    });
  }
);
