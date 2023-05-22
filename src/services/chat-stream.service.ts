import { SendMessageInput } from "../types/Message";
import { invokeChatCompletion } from "../utils/stream-chat";

export async function sendMessageService(sendMessageDTO: SendMessageInput) {
  return invokeChatCompletion(sendMessageDTO.messages);
}
