import { Request, Response, Router } from "express";
import imageFiles from "../data/filePaths.json";
import {
  createImageMapper,
  verifySessionIsValid,
  listSessions,
  listLatestSessions,
  getSession,
} from "../services/db";
import { getSurveyJson } from "../services/survey";
import { synonyms, antonyms } from "../data/filePathModified";
import logger from "../services/logger";
const imageRouter = Router();

imageRouter.get("/", (_req, res) => {
  return res.status(200).send(`<h1>Welcome to Survey App</h1>`);
});

imageRouter.get("/getImages", async (req: Request, res: Response) => {
  const sessionId = req.headers["session-id"];
  const count = req.query.count;
  const pageCount = req.query?.pageCount ? Number(req.query.pageCount) : 25;
  try {
    const isValidSession = await verifySessionIsValid(sessionId as string);

    if (!isValidSession) {
      return res.status(400).json({
        message: "Invalid Session",
      });
    }

    const getCurrentSession = await getSession(sessionId as string);

    logger.info("getCurrentSession", getCurrentSession);

    // get 250 synonyms and antonyms urls each per survey
    // 1323 synonym urls 1323 / 250 = 5 cycles
    // 1549 antonym urls 1549 / 250 = 6 cycles

    // get the session number from session list query
    const sessionNumber = parseInt(getCurrentSession?.Item?.index.N ?? "1");

    const synonymSliceStart = (sessionNumber + 1) * 10;
    const synonymSliceEnd =
      synonymSliceStart + 250 > 1322 ? 1322 : synonymSliceStart + 250;

    const antonymSliceStart = (sessionNumber + 1) * 10;
    const antonymSliceEnd =
      antonymSliceStart + 250 > 1548 ? 1548 : antonymSliceStart + 250;

    const synonymsUrls =
      synonyms.slice(synonymSliceStart, synonymSliceEnd).length < 250
        ? synonyms
            .slice(synonymSliceStart, synonymSliceEnd)
            .concat(
              synonyms.slice(
                0,
                250 - synonyms.slice(synonymSliceStart, synonymSliceEnd).length
              )
            )
        : synonyms.slice(synonymSliceStart, synonymSliceEnd);

    const antonymUrls =
      antonyms.slice(antonymSliceStart, antonymSliceEnd).length < 250
        ? antonyms
            .slice(antonymSliceStart, antonymSliceEnd)
            .concat(
              antonyms.slice(
                0,
                250 - antonyms.slice(antonymSliceStart, antonymSliceEnd).length
              )
            )
        : antonyms.slice(antonymSliceStart, antonymSliceEnd);

    const images = imageFiles.slice(0, Number(count));

    await createImageMapper({
      tableName: process.env.IMAGE_MAPPER_TABLE as string,
      imageIds: images.map((image) => image),
      sessionId: sessionId as string,
    });

    const appendBucketUrls = [...synonymsUrls, ...antonymUrls].map(
      (image) => process.env.S3_BUCKET_URL + image
    );

    logger.info("appendBucketUrls", appendBucketUrls[0]);

    appendBucketUrls.sort(() => Math.random() - 0.5);

    logger.info("Lenght of appendBucketUrls", appendBucketUrls.length);

    const surveyJson = getSurveyJson(appendBucketUrls, pageCount);

    return res.status(200).json(surveyJson);
  } catch (error: any) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default imageRouter;
