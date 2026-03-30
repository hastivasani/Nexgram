import { useState, useEffect } from "react";

const PUZZLES = [
  { emojis: "🦁👑", answer: "LION KING" },
  { emojis: "🕷🧑", answer: "SPIDERMAN" },
  { emojis: "🧊❄🏰", answer: "FROZEN" },
  { emojis: "🦸🦸", answer: "AVENGERS" },
  { emojis: "🐠🔍", answer: "FINDING NEMO" },
  { emojis: "🧙💍", answer: "LORD OF THE RINGS" },
  { emojis: "🚀🌌⭐", answer: "STAR WARS" },
  { emojis: "🦇🧑🌃", answer: "BATMAN" },
  { emojis: "🧟🌍", answer: "WALKING DEAD" },
  { emojis: "🐉🔥👸", answer: "GAME OF THRONES" },
  { emojis: "🤖🚗", answer: "TRANSFORMERS" },
  { emojis: "🧸❤🌈", answer: "TOY STORY" },
  { emojis: "🐧🎩🎩", answer: "PENGUINS" },
  { emojis: "🦊🌲", answer: "ZOOTOPIA" },
  { emojis: "🏎💨🏁", answer: "FAST AND FURIOUS" },
];

export default function EmojiGuess({ onGameEnd, lobbyId, players, currentUser, socket }) {
  const isSolo = !players || players.length < 2;
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [scores, setScores] = useState({});
  const [hint, setHint] = useState("");
  const [done, setDone] = useState(false);
  const myId = currentUser?._id;
  const opponent = players?.find(p => (p.user?._id || p.user)?.toString() !== myId?.toString());
  const puzzle = PUZZLES[idx];

  useEffect(() => {
    if (!socket || isSolo) return;
    const onAction = ({ action, payload }) => {
      if (action === "eg_answer") {
        setScores(prev => ({ ...prev, [payload.userId]: (prev[payload.userId] || 0) + payload.pts }));
        setHint(`${payload.username} answered! ${payload.correct ? "✅" : "❌"}`);
        setTimeout(() => {
          if (idx + 1 >= PUZZLES.length) setDone(true);
          else { setIdx(i => i + 1); setInput(""); setHint(""); }
        }, 1200);
      }
    };
    socket.on("gameAction", onAction);
    return () => socket.off("gameAction", onAction);
  }, [socket, isSolo, idx]);

  const submit = () => {
    if (!input.trim() || done) return;
    const correct = input.trim().toUpperCase() === puzzle.answer;
    const pts = correct ? 15 : 0;
    setScores(prev => ({ ...prev, [myId]: (prev[myId] || 0) + pts }));
    setHint(correct ? "✅ Correct! +15" : `❌ Answer: ${puzzle.answer}`);
    if (!isSolo && socket) socket.emit("gameAction", { lobbyId, action: "eg_answer", payload: { userId: myId, username: currentUser.username, pts, correct } });
    setTimeout(() => {
      if (idx + 1 >= PUZZLES.length) setDone(true);
      else { setIdx(i => i + 1); setInput(""); setHint(""); }
    }, 1200);
  };

  const myScore = scores[myId] || 0;
  const oppScore = scores[opponent?.user?._id || "opp"] || 0;

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🎭 Emoji Guess</h2>
          <span className="text-purple-400 font-bold">{idx + 1}/{PUZZLES.length}</span>
        </div>

        {!isSolo && (
          <div className="flex justify-between bg-theme-card rounded-xl p-3 border border-theme mb-4 text-sm">
            <span className="text-blue-400 font-bold">You: {myScore}</span>
            <span className="text-theme-muted">vs</span>
            <span className="text-orange-400 font-bold">{opponent?.user?.username || "Opp"}: {oppScore}</span>
          </div>
        )}

        {done ? (
          <div className="text-center bg-theme-card rounded-2xl p-6 border border-theme">
            <p className="text-4xl mb-2">{myScore > oppScore || isSolo ? "🏆" : "😔"}</p>
            <p className="text-xl font-bold text-theme-primary">{isSolo ? `Score: ${myScore}` : myScore > oppScore ? "You Win!" : "You Lose!"}</p>
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={() => { setIdx(0); setScores({}); setDone(false); setInput(""); setHint(""); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center bg-theme-card rounded-2xl p-8 border border-theme mb-6">
              <p className="text-xs text-theme-muted mb-3">What movie/show is this?</p>
              <p className="text-6xl mb-3">{puzzle.emojis}</p>
              {hint && <p className="text-sm font-bold">{hint}</p>}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="Type your answer..."
                className="flex-1 bg-theme-input text-theme-primary rounded-xl px-4 py-3 outline-none border border-theme focus:border-purple-500 font-bold uppercase" />
              <button onClick={submit} className="bg-purple-600 text-white px-5 rounded-xl font-bold">Go</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
