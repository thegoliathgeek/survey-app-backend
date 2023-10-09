import serverless from "serverless-http";
import express from "express";
import { Request, Response } from "express";
import SessionRouter from "./src/routes/session";
import ImageRouter from "./src/routes/image";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

// Routes
app.use("/", SessionRouter);
app.use("/images", ImageRouter);

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
