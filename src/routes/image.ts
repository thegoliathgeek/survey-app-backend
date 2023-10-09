import { Request, Response, Router } from "express";
import imageFiles from "../data/filePaths.json";
import { createImageMapper, verifySessionIsValid } from "../services/db";
import { getSurveyJson } from "../services/survey";

const imageRouter = Router();

imageRouter.get("/", (_req, res) => {
  return res.status(200).send(`<h1>Welcome to Survey App</h1>`);
});

imageRouter.get("/map", async (req: Request, res: Response) => {
  const sessionId = req.headers["session-id"];
  const count = req.query.count;
  try {
    const isValidSession = await verifySessionIsValid(sessionId as string);

    if (!isValidSession) {
      return res.status(400).json({
        message: "Invalid Session",
      });
    }

    const images = imageFiles.slice(0, Number(count));

    await createImageMapper({
      tableName: process.env.IMAGE_MAPPER_TABLE as string,
      imageIds: images.map((image) => image),
      sessionId: sessionId as string,
    });

    const appendBucketUrls = images.map(
      (image) => process.env.S3_BUCKET_URL + image
    );

    const surveyJson = getSurveyJson(appendBucketUrls);

    return res.status(200).json(surveyJson);
  } catch (error: any) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default imageRouter;
