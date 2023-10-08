import serverless from "serverless-http";
import express from "express";
import { Request, Response } from "express";
import SessionRouter from "./src/routes/session";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", SessionRouter);

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
