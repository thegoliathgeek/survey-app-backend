import { Router, Request, Response } from "express";
import files from "../data/filePaths.json";
import {
  createSession,
  updateSession,
  verifySessionIsValid,
  listLatestSessions,
} from "../services/db";
import logger from "../services/logger";

const router = Router();
//

router.get("/", (_req: Request, res: Response) => {
  return res.status(200).send(`<h1>Welcome to Survey App</h1>`);
});

router.post("/new/session", async (_req: Request, res: Response) => {
  try {
    const latestSession = await listLatestSessions();
    let newIndex = 1;
    logger.info("latestSession", latestSession);

    if (latestSession) {
      if (latestSession[0]?.index) {
        newIndex = (latestSession[0].index + 1) as number;
        if (newIndex > 20) {
          newIndex = 1;
        }
      }
    }

    const session = await createSession({
      tableName: process.env.SESSION_TABLE as string,
      sessionData: JSON.stringify({}),
      demoGraphicsData: JSON.stringify({}),
      // set ttl to 1 hour
      ttl: Math.floor(Date.now() / 1000) + 60 * 60,
      index: newIndex ?? 1,
    });
    return res.status(200).json({
      session: {
        ...session,
        ttl: Math.floor(Date.now() / 1000) + 60 * 60,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

router.post("/save-response", async (req: Request, res: Response) => {
  const sessionId = req.headers["session-id"];
  const response = req.body.response;

  const isValidSession = await verifySessionIsValid(sessionId as string);
  if (!isValidSession) {
    return res.status(400).json({
      message: "Invalid Session",
    });
  }
  const sessionResponse = await updateSession({
    sessionData: response,
    id: sessionId as string,
    tableName: process.env.SESSION_TABLE as string,
    ttl: Math.floor(Date.now() / 1000) + 60 * 60,
  });

  if (!sessionResponse) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  return res.status(200).json({
    message: "Response Saved",
  });
});

export default router;
