import { useState } from "react";
import { sendChat } from "../api/chatApi.js";

let nextId = 1;
const makeMessage = (role, content, isError = false) => ({
  id: nextId++,
  role,
  content,
  isError,
});

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // History = earlier messages only, without error bubbles
    const history = messages
      .filter((m) => !m.isError)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, makeMessage("user", trimmed)]);
    setIsLoading(true);

    try {
      const reply = await sendChat(trimmed, history);
      setMessages((prev) => [...prev, makeMessage("assistant", reply)]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        makeMessage("assistant", "Sorry, something went wrong. Please try again.", true),
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setMessages([]);
  }

  return { messages, isLoading, sendMessage, reset };
}
