import { Router, Request, Response } from "express";
import files from "../data/filePaths.json";
import {
  createSession,
  updateSession,
  verifySessionIsValid,
  listLatestSessions,
} from "../services/db";
import { format } from "path";

const router = Router();
//

router.get("/", (_req: Request, res: Response) => {
  return res.status(200).send(`<h1>Welcome to Survey App</h1>`);
});

router.post("/new/session", async (_req: Request, res: Response) => {
  try {

    const latestSession = await listLatestSessions();
    let newIndex = 1
    console.log("latestSession", latestSession);

    if (latestSession) {
      if(latestSession[0].index) {
        newIndex = latestSession[0].index + 1 as number
      }}

     

    const session = await createSession({
      tableName: process.env.SESSION_TABLE as string,
      sessionData: JSON.stringify({}),
      // set ttl to 1 hour
      ttl: Math.floor(Date.now() / 1000) + 60 * 60,
      index: newIndex ?? 1
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

  console.log("req.body", req.body)
  const {response , questionDetails} = await req.body.response;





  const isValidSession = await verifySessionIsValid(sessionId as string);
  if (!isValidSession) {
    return res.status(400).json({
      message: "Invalid Session",
    });
  }


  const formattedResponse : any = []

  for(let i = 0 ; i < questionDetails.pages.length ; i++) {
    const page = questionDetails.pages[i];
    const elements = page.elements;
  
    if (elements && elements[0]) {
      const choices = elements[0].choices;
  
      if (choices) {
        formattedResponse.push({
          images_shown: choices.map((choice) => choice.value),
          image_links: choices.map((choice) => choice.imageLink),
          selected: response[`${elements[0].name}`],
        })} else {
          formattedResponse.push({
            images_shown: [],
            image_links: [],
            selected: response[`${elements[0].name}`],
          })
         }
  } else {
    formattedResponse.push({
      images_shown: [],
      image_links: [],
      selected: response[`${elements[0].name}`],
    })
  }
  }

  const sessionResponse = await updateSession({
    sessionData: formattedResponse,
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
