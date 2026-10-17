export default function MessageBubble({ role, content, isError = false }) {
  const classes = ["bubble", `bubble--${role}`, isError ? "bubble--error" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`message-row message-row--${role}`}>
      <div className={classes}>{content}</div>
    </div>
  );
}
