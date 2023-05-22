import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import router from "../routes";
import {
  errorHandler,
  methodNotAllowed,
  notFound,
} from "./../middlewares/ErrorHandler";

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.set("trust proxy", 1);

  app.use(express.urlencoded({ extended: true }));

  // To enable logging during development / staging
  if (process.env.NODE_ENV !== "PRODUCTION") app.use(morgan("dev"));

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
      allowedHeaders: ["Content-Type", "Accept"],
    })
  );

  app.use(router);

  app.use(notFound);

  app.use(methodNotAllowed);

  app.use(errorHandler);

  app.use(function (
    err: any,
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.status(err.status || 500).json({ error: err.message });
    next();
  });

  return app;
};

export default createServer;
