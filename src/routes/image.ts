import { Request, Response, Router } from "express";
import imageFiles from "../data/filePaths.json";
import { createImageMapper, verifySessionIsValid } from "../services/db";
import { getSurveyJson } from "../services/survey";
import { synonyms, antonyms } from "../data/filePathModified";
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

    // get 250 synonyms and antonyms urls each per survey
    // 1182 synonym urls 1182 / 250 = 4 cycles
    // 707 antonym urls 707 / 250 = 3 cycles

    // get the session number from session list query
    const synonymSessionNumber = 1;
    const antonymSessionNumber = 1;

    const synonymSliceStart = (synonymSessionNumber - 1) * 10;
    const synonymSliceEnd =
      synonymSliceStart + 250 > 1182 ? 1182 : synonymSliceStart + 250;

    const antonymSliceStart = (antonymSessionNumber - 1) * 10;
    const antonymSliceEnd =
      antonymSliceStart + 250 > 707 ? 707 : antonymSliceStart + 250;

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
