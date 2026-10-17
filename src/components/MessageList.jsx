import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

const GREETING = "Hi! Ask me about restaurants, menus or reservations.";

export default function MessageList({ messages, isLoading }) {
  const bottomRef = useRef(null);

  // Scroll to the newest message whenever something changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="message-list" aria-live="polite">
      {messages.length === 0 && <MessageBubble role="assistant" content={GREETING} />}
      {messages.map((m) => (
        <MessageBubble key={m.id} role={m.role} content={m.content} isError={m.isError} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
