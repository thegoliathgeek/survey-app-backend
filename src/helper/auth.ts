import { Request, Response, NextFunction } from "express";
import logger from "../services/logger";
import { verifySessionIsValid } from "../services/db";

export const authChecker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.headers["session-id"];
    if (!sessionId) {
      logger.error("No session id found");
      return res.status(400).json({
        message: "Invalid Session",
      });
    }

    const isValidSession = await verifySessionIsValid(sessionId as string);
    if (!isValidSession) {
      return res.status(400).json({
        message: "Invalid Session",
      });
    }

    return next();
  } catch (error) {
    logger.error("Error in authChecker", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
