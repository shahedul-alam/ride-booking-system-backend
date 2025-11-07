import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/appError";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(httpStatus.NOT_FOUND, `Not Found - ${req.originalUrl}`);

  next(error);
};
