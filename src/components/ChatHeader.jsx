export default function ChatHeader({ onReset }) {
  return (
    <header className="chat-header">
      <div className="chat-header__title">
        <span aria-hidden="true">🍽</span>
        <h1>Restaurant Assistant</h1>
      </div>
      <button className="chat-header__reset" onClick={onReset}>
        New chat
      </button>
    </header>
  );
}
