import { createParser } from "eventsource-parser";
import { IMessage } from "../types/Message";

function onParse(event: any) {
  if (event.type === "event") {
    if (event.data !== "[DONE]") {
      console.log(JSON.parse(event.data).choices[0].delta?.content || "");
    }
  } else if (event.type === "reconnect-interval") {
    console.log(
      "We should set reconnect interval to %d milliseconds",
      event.value
    );
  }
}

export async function invokeChatCompletion(messages: IMessage[]) {
  let response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.8,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 1,
      max_tokens: 20,
      stream: true,
    }),
  });

  const parser = createParser(onParse);

  for await (const value of (response as any)?.body?.pipeThrough(
    new TextDecoderStream()
  )) {
    console.log("Received", value);
    parser.feed(value);
  }

  return response;
}
