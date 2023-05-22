import express from "express";
import validateResource from "../middlewares/ValidateResource";
import { sendMessageSchema } from "../types/Message";
import messageRoutes from "./chat-stream.routes";

const router = express.Router();

router.get("/", (_req, res) => {
  res.send("Welcome to Work Ninja Streaming API SERVICE!!!");
});

router.use("/v1/api", validateResource(sendMessageSchema), messageRoutes);

export default router;
