export default function TypingIndicator() {
  return (
    <div className="message-row message-row--assistant" aria-label="Assistant is typing">
      <div className="bubble bubble--assistant typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
