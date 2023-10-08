import { Router, Request, Response } from "express";
import files from "../data/filePaths.json";
import { createSession, verifySessionIsValid } from "../services/db";

const router = Router();
//

router.get("/", (_req: Request, res: Response) => {
  return res.status(200).send(`<h1>Welcome to Survey App</h1>`);
});

router.post("/new/session", async (_req: Request, res: Response) => {
  try {
    const session = await createSession({
      tableName: process.env.SESSION_TABLE as string,
      sessionData: JSON.stringify({}),
      // set ttl to 1 hour
      ttl: Math.floor(Date.now() / 1000) + 60 * 60,
    });
    return res.status(200).json({
      session,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

router.get("/files", async (req: Request, res: Response) => {
  const sessionId = req.headers["session-id"];
  const isValidSession = await verifySessionIsValid(sessionId as string);
  if (!isValidSession) {
    return res.status(400).json({
      message: "Invalid Session",
    });
  }
  return res.status(200).json(files);
});

export default router;
