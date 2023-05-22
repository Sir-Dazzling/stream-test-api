import { object } from "zod";

export class IMessage {
  role: string;
  content: string;
}

export class SendMessageInput {
  messages: IMessage[];
}

export class MessageResponse {}

export const sendMessageSchema = object({
  body: object({
    messages: object(IMessage as any, { required_error: "Required" }).array(),
  }),
});
