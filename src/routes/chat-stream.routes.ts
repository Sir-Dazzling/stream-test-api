import { createParser } from "eventsource-parser";
import express from "express";
import { sendMessage } from "../controllers/chat-steam.controller";

const router = express.Router();

router.post("/send-message", sendMessage);

router.get("/stream", async (req, res) => {
  try {
    res.writeHead(200, {
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });

    const { messages } = req.query;
    const parsedMessages = JSON.parse(messages as string);

    let message = "";

    let response = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: parsedMessages,
        temperature: 0.8,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
        max_tokens: 1000,
        stream: true,
      }),
    });

    console.log("maw ", response.body);

    const parser = createParser((event: any) => {
      if (event.type === "event") {
        if (event.data !== "[DONE]") {
          message += JSON.parse(event.data).choices[0].delta?.content || "";
          if (!JSON.parse(event.data).choices[0].delta?.content) return;
          res.write("event: ping\n");
          console.log("omo ", JSON.parse(event.data).choices[0].delta?.content);

          res.write(
            `data: ${JSON.parse(event.data).choices[0].delta?.content} `
          );
          res.write("\n\n");
        } else {
          res.write("event: ping\n");
          res.write(`data: ${event.data}`);
          res.write("\n\n");
          console.log("event ended", event.data);
        }
      }
    });

    for await (const value of (response as any)?.body?.pipeThrough(
      new TextDecoderStream()
    )) {
      parser.feed(value);
    }
  } catch (error) {
    console.error("erro ", error);
  }
});

export default router;
