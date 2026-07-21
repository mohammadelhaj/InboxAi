import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors.js";
import { logger } from "../logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = (req as any).requestId;

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, requestId },
    });
    return;
  }

  logger.error({ err, requestId }, "unhandled error");

  res.status(500).json({
    error: { code: "INTERNAL", message: "Internal server error", requestId },
  });
}