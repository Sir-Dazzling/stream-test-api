import express from "express";
import { sendMessage } from "../controllers/chat-steam.controller";

const router = express.Router();

router.post("/send-message", sendMessage);

export default router;
