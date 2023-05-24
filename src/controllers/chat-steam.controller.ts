import { NextFunction, Request, Response } from "express";
import { sendMessageService } from "../services/chat-stream.service";
import createHttpError from "http-errors";

export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    return res.status(201).send(await sendMessageService(req.body));
  } catch (error: any) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }
    console.error("erro ", error);
    return next(createHttpError(500, message));
  }
}
