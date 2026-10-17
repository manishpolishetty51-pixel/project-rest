import { useState } from "react";

export default function ChatInput({ onSend, disabled = false }) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(e) {
    // Enter sends, Shift+Enter inserts a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="chat-input">
      <textarea
        rows={1}
        value={text}
        placeholder="Type your message..."
        aria-label="Message"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button onClick={submit} disabled={disabled || !text.trim()}>
        Send
      </button>
    </div>
  );
}
