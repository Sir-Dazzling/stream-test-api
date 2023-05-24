import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
import { IMessage } from "../types/Message";

export function onParse(event: any) {
  if (event.type === "event") {
    if (event.data !== "[DONE]") {
      // console.log(JSON.parse(event.data).choices[0].delta?.content || "");
    }
  } else if (event.type === "reconnect-interval") {
    console.log(
      "We should set reconnect interval to %d milliseconds",
      event.value
    );
  }
  return "";
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

export async function invokeChatCompletionAlt(messages: IMessage[]) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  console.log("mess ", messages);

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.4,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 150,
      stream: true,
      n: 1,
    }),
  });

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || "";
            console.log("text ", text);

            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
