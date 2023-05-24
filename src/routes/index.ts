import express from "express";
import messageRoutes from "./chat-stream.routes";

const router = express.Router();

router.get("/", (_req, res) => {
  res.send("Welcome to Work Ninja Streaming API SERVICE!!!");
});

router.use("/v1/api", messageRoutes);

export default router;
