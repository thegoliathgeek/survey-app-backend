import { Request, Response, Router } from "express";

const surveyRouter = Router();

surveyRouter.get("/", (_req, res) => {
  return res.status(200).send(`<h1>Welcome to Survey App</h1>`);
});

surveyRouter.get("/json", (req: Request, res: Response) => {
  try {
    //
  } catch (error: any) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default surveyRouter;
