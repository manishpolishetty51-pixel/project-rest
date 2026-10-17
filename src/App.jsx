import ChatHeader from "./components/ChatHeader.jsx";
import MessageList from "./components/MessageList.jsx";
import SuggestionChips from "./components/SuggestionChips.jsx";
import ChatInput from "./components/ChatInput.jsx";
import useChat from "./hooks/useChat.js";

export default function App() {
  const { messages, isLoading, sendMessage, reset } = useChat();

  return (
    <div className="app">
      <div className="chat-window">
        <ChatHeader onReset={reset} />
        <MessageList messages={messages} isLoading={isLoading} />
        {messages.length === 0 && <SuggestionChips onPick={sendMessage} />}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
