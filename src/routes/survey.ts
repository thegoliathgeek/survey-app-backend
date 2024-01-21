import { Request, Response, Router } from "express";
import { updateSession } from "../services/db";
import { authChecker } from "../helper/auth";

const surveyRouter = Router();

surveyRouter.get("/", (_req, res) => {
  return res.status(200).send(`<h1>Welcome to Survey App</h1>`);
});

surveyRouter.get("/welcome/terms", (req: Request, res: Response) => {
  try {
    const welcomeJson = {
      title: "Welcome",
      pages: [
        {
          name: "page1",
          elements: [
            {
              type: "html",
              name: "welcome",
              html: "<h1>Welcome to the Survey App</h1><h4>By clicking on the button below, you agree to participate in this study.</h4>",
            },
          ],
        },
      ],
    };
    return res.status(200).json(welcomeJson);
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
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

surveyRouter.post(
  "/save/demographics",
  authChecker,
  async (req: Request, res: Response) => {
    try {
      const response = req.body;
      const sessionId = req.headers["session-id"];
      await updateSession(
        {
          demoGraphicsData: JSON.stringify(response),
          tableName: process.env.SESSION_TABLE as string,
          id: sessionId as string,
        },
        true
      );

      return res.status(200).json({
        message: "Response saved successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  }
);

surveyRouter.get("/demographics", (req: Request, res: Response) => {
  return res.status(200).json({
    title: "DemoGraphics",
    pages: [
      {
        name: "page1",
        elements: [
          {
            type: "radiogroup",
            name: "gender",
            title: "What is your gender?",
            choices: [
              { value: "male", text: "Male" },
              { value: "female", text: "Female" },
              { value: "non_binary", text: "Non-binary/Third gender" },
              {
                value: "prefer_self_describe",
                text: "Prefer to self-describe",
              },
              { value: "prefer_not_to_say", text: "Prefer not to say" },
            ],
          },
          {
            type: "text",
            name: "custom_gender",
            visibleIf: "{gender} == 'prefer_self_describe'",
            title: "Self describe your gender",
            maxLength: 300,
          },
          {
            type: "radiogroup",
            name: "ageGroup",
            title: "What is your age group?",
            choices: [
              { value: "under_18", text: "Under 18" },
              { value: "18_24", text: "18-24" },
              { value: "25_34", text: "25-34" },
              { value: "35_44", text: "35-44" },
              { value: "45_54", text: "45-54" },
              { value: "55_64", text: "55-64" },
              { value: "65_over", text: "65 and over" },
            ],
          },
          {
            type: "checkbox",
            name: "raceEthnicity",
            title:
              "Which of the following best describes your race or ethnicity? (Please select all that apply.)",
            choices: [
              { value: "white", text: "White" },
              { value: "black", text: "Black/African American" },
              { value: "hispanic", text: "Hispanic/Latino" },
              { value: "asian", text: "Asian" },
              { value: "native", text: "Native American" },
              {
                value: "pacific",
                text: "Native Hawaiian or Other Pacific Islander",
              },
              { value: "multiracial", text: "Multiracial" },
              { value: "other", text: "Other" },
            ],
          },
          {
            type: "text",
            name: "residence",
            title: "What is your current place of residence?",
          },
          {
            type: "text",
            name: "zipCode",
            title: "Please specify your Zip code if you live in US.",
            visibleIf: { expression: "{residence} === 'US'" },
          },
          {
            type: "text",
            name: "country",
            title: "Please specify your country:",
            visibleIf: { expression: "{residence} !== 'US'" },
          },
        ],
      },
    ],
  });
});

export default surveyRouter;
