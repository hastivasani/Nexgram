import { useState, useEffect, useRef } from "react";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog",
  "React makes it painless to create interactive UIs",
  "JavaScript is the language of the web",
  "Practice makes perfect every single day",
  "Code is like humor when you have to explain it",
  "First solve the problem then write the code",
  "Keep it simple and straightforward always",
  "Every expert was once a beginner",
];

export default function SpeedTyping({ onGameEnd, lobbyId, players, currentUser, socket }) {
  const isSolo = !players || players.length < 2;
  const [sentence] = useState(() => SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTime] = useState(60);
  const [scores, setScores] = useState({});
  const [oppDone, setOppDone] = useState(null);
  const timerRef = useRef(null);
  const myId = currentUser?._id;
  const opponent = players?.find(p => (p.user?._id || p.user)?.toString() !== myId?.toString());

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (!socket || isSolo) return;
    const onAction = ({ action, payload }) => {
      if (action === "st_done") {
        setOppDone({ username: payload.username, wpm: payload.wpm });
        setScores(prev => ({ ...prev, [payload.userId]: payload.wpm }));
      }
    };
    socket.on("gameAction", onAction);
    return () => socket.off("gameAction", onAction);
  }, [socket, isSolo]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (!started) setStarted(true);
    setInput(val);
    if (val === sentence) {
      clearInterval(timerRef.current);
      setFinished(true);
      const elapsed = 60 - timeLeft + 1;
      const wpm = Math.round((sentence.split(" ").length / elapsed) * 60);
      setScores(prev => ({ ...prev, [myId]: wpm }));
      if (!isSolo && socket) socket.emit("gameAction", { lobbyId, action: "st_done", payload: { userId: myId, username: currentUser.username, wpm } });
    }
  };

  const myWpm = scores[myId] || 0;
  const oppWpm = scores[opponent?.user?._id || "opp"] || 0;

  const correct = input.length > 0 && sentence.startsWith(input);

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">⌨️ Speed Typing</h2>
          <span className={`font-bold ${timeLeft <= 10 ? "text-red-400" : "text-purple-400"}`}>{timeLeft}s</span>
        </div>

        {!isSolo && (
          <div className="flex justify-between bg-theme-card rounded-xl p-3 border border-theme mb-4 text-sm">
            <span className="text-blue-400 font-bold">You: {myWpm} WPM</span>
            <span className="text-theme-muted">vs</span>
            <span className="text-orange-400 font-bold">{opponent?.user?.username || "Opp"}: {oppWpm} WPM</span>
          </div>
        )}

        <div className="bg-theme-card rounded-2xl p-5 border border-theme mb-4">
          <p className="text-sm leading-relaxed text-theme-primary font-mono">
            {sentence.split("").map((ch, i) => (
              <span key={i} className={
                i < input.length
                  ? input[i] === ch ? "text-green-400" : "text-red-400 bg-red-400/20"
                  : i === input.length ? "border-b-2 border-purple-400" : "text-theme-muted"
              }>{ch}</span>
            ))}
          </p>
        </div>

        {finished ? (
          <div className="text-center bg-theme-card rounded-2xl p-5 border border-theme">
            <p className="text-3xl mb-2">🏁</p>
            <p className="text-xl font-bold text-theme-primary">{myWpm} WPM</p>
            {oppDone && <p className="text-sm text-theme-muted mt-1">{oppDone.username}: {oppDone.wpm} WPM</p>}
            <p className="text-sm text-theme-muted mt-1">{!isSolo ? (myWpm > oppWpm ? "You Win! 🏆" : "You Lose! 😔") : ""}</p>
            <button onClick={onGameEnd} className="mt-4 bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-bold">Exit</button>
          </div>
        ) : (
          <textarea value={input} onChange={handleChange}
            placeholder="Start typing here..."
            rows={3}
            className={`w-full bg-theme-input text-theme-primary rounded-xl px-4 py-3 outline-none border-2 font-mono text-sm resize-none transition-colors ${
              input.length === 0 ? "border-theme" : correct ? "border-green-500" : "border-red-500"
            }`}
          />
        )}
      </div>
    </div>
  );
}
