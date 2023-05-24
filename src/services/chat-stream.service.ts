import { SendMessageInput } from "../types/Message";
import { invokeChatCompletionAlt } from "../utils/stream-chat";

export async function sendMessageService(sendMessageDTO: SendMessageInput) {
  return await invokeChatCompletionAlt(sendMessageDTO.messages);
}
