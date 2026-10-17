const SUGGESTIONS = [
  "Indian restaurants",
  "What Chinese places do you recommend?",
  "Is Spice Palace free on 2024-11-15?",
];

export default function SuggestionChips({ onPick }) {
  return (
    <div className="chips">
      {SUGGESTIONS.map((text) => (
        <button key={text} className="chip" onClick={() => onPick(text)}>
          {text}
        </button>
      ))}
    </div>
  );
}
