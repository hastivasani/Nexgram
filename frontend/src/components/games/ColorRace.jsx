import { useState, useEffect, useRef } from "react";

const COLORS = ["🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪"];
const ROUNDS = 5;

export default function ColorRace({ onGameEnd, lobbyId, players, currentUser, socket }) {
  const isSolo = !players || players.length < 2;
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const timerRef = useRef(null);

  const myId = currentUser?._id;
  const opponent = players?.find(p => (p.user?._id || p.user)?.toString() !== myId?.toString());

  const nextRound = (r) => {
    const t = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTarget(t);
    setFeedback("");
    setWaiting(false);
    setRound(r);
    if (!isSolo && socket) socket.emit("gameAction", { lobbyId, action: "cr_round", payload: { round: r, target: t } });
  };

  useEffect(() => { nextRound(1); }, []);

  useEffect(() => {
    if (!socket || isSolo) return;
    const onAction = ({ action, payload }) => {
      if (action === "cr_round") { setTarget(payload.target); setRound(payload.round); setFeedback(""); setWaiting(false); }
      if (action === "cr_score") {
        setScores(prev => ({ ...prev, [payload.userId]: (prev[payload.userId] || 0) + payload.pts }));
        setFeedback(`${payload.username} tapped first! +${payload.pts}`);
        setWaiting(true);
        timerRef.current = setTimeout(() => {
          if (payload.round >= ROUNDS) setDone(true);
          else nextRound(payload.round + 1);
        }, 1200);
      }
    };
    socket.on("gameAction", onAction);
    return () => { socket.off("gameAction", onAction); clearTimeout(timerRef.current); };
  }, [socket, isSolo]);

  const handleTap = (color) => {
    if (waiting || done) return;
    const correct = color === target;
    const pts = correct ? 10 : -3;
    const newScores = { ...scores, [myId]: (scores[myId] || 0) + pts };
    setScores(newScores);
    setFeedback(correct ? "✅ Correct! +10" : "❌ Wrong! -3");
    setWaiting(true);
    if (!isSolo && socket) {
      socket.emit("gameAction", { lobbyId, action: "cr_score", payload: { userId: myId, username: currentUser.username, pts, round } });
    }
    timerRef.current = setTimeout(() => {
      if (round >= ROUNDS) setDone(true);
      else nextRound(round + 1);
    }, 1000);
  };

  const myScore = scores[myId] || 0;
  const oppScore = scores[opponent?.user?._id || "opp"] || 0;

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🎨 Color Race</h2>
          <span className="text-purple-400 font-bold">{round}/{ROUNDS}</span>
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
            <p className="text-xl font-bold text-theme-primary mb-1">
              {isSolo ? `Score: ${myScore}` : myScore > oppScore ? "You Win!" : myScore === oppScore ? "Draw!" : "You Lose!"}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={() => { setScores({}); setDone(false); nextRound(1); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center bg-theme-card rounded-2xl p-6 border border-theme mb-6">
              <p className="text-theme-muted text-sm mb-2">Tap this color!</p>
              <p className="text-7xl">{target}</p>
              {feedback && <p className="mt-3 text-sm font-bold text-theme-primary">{feedback}</p>}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map(c => (
                <button key={c} onClick={() => handleTap(c)}
                  className="aspect-square text-4xl rounded-2xl bg-theme-card border-2 border-theme hover:border-purple-400 hover:scale-105 transition-all active:scale-95">
                  {c}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
