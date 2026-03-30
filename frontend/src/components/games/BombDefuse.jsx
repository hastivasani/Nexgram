import { useState, useEffect, useRef } from "react";

const WIRES = ["🔴","🔵","🟡","🟢","⚪","🟠"];
function genBomb() {
  const safe = Math.floor(Math.random() * WIRES.length);
  return { wires: WIRES, safe, timeLimit: 20 };
}

export default function BombDefuse({ onGameEnd, lobbyId, players, currentUser, socket }) {
  const isSolo = !players || players.length < 2;
  const [bomb, setBomb] = useState(genBomb);
  const [timeLeft, setTime] = useState(20);
  const [cut, setCut] = useState(null);
  const [scores, setScores] = useState({});
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const [exploded, setExploded] = useState(false);
  const timerRef = useRef(null);
  const myId = currentUser?._id;
  const opponent = players?.find(p => (p.user?._id || p.user)?.toString() !== myId?.toString());

  useEffect(() => {
    if (cut !== null || done) return;
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); setExploded(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [bomb, cut, done]);

  useEffect(() => {
    if (!socket || isSolo) return;
    const onAction = ({ action, payload }) => {
      if (action === "bd_cut") {
        clearInterval(timerRef.current);
        setCut(payload.wire);
        const correct = payload.wire === bomb.safe;
        setScores(prev => ({ ...prev, [payload.userId]: (prev[payload.userId] || 0) + (correct ? 20 : 0) }));
        setTimeout(() => nextRound(), 1500);
      }
    };
    socket.on("gameAction", onAction);
    return () => socket.off("gameAction", onAction);
  }, [socket, isSolo, bomb]);

  const nextRound = () => {
    if (round >= 5) { setDone(true); return; }
    const nb = genBomb();
    setBomb(nb);
    setCut(null);
    setExploded(false);
    setTime(20);
    setRound(r => r + 1);
  };

  const cutWire = (idx) => {
    if (cut !== null || exploded || done) return;
    clearInterval(timerRef.current);
    setCut(idx);
    const correct = idx === bomb.safe;
    setScores(prev => ({ ...prev, [myId]: (prev[myId] || 0) + (correct ? 20 : 0) }));
    if (!isSolo && socket) socket.emit("gameAction", { lobbyId, action: "bd_cut", payload: { userId: myId, wire: idx } });
    setTimeout(() => nextRound(), 1500);
  };

  const myScore = scores[myId] || 0;
  const oppScore = scores[opponent?.user?._id || "opp"] || 0;

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">💣 Bomb Defuse</h2>
          <span className={`font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-purple-400"}`}>{timeLeft}s</span>
        </div>

        {!isSolo && (
          <div className="flex justify-between bg-theme-card rounded-xl p-3 border border-theme mb-4 text-sm">
            <span className="text-blue-400 font-bold">You: {myScore}</span>
            <span className="text-theme-muted">Round {round}/5</span>
            <span className="text-orange-400 font-bold">{opponent?.user?.username || "Opp"}: {oppScore}</span>
          </div>
        )}

        {done ? (
          <div className="text-center bg-theme-card rounded-2xl p-6 border border-theme">
            <p className="text-4xl mb-2">{myScore > oppScore || isSolo ? "🏆" : "😔"}</p>
            <p className="text-xl font-bold text-theme-primary">{isSolo ? `Score: ${myScore}` : myScore > oppScore ? "You Win!" : "You Lose!"}</p>
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={() => { setScores({}); setRound(1); setBomb(genBomb()); setCut(null); setExploded(false); setTime(20); setDone(false); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <div className="bg-theme-card rounded-2xl p-6 border-2 border-red-500/50 text-center">
            <p className="text-6xl mb-4">{exploded ? "💥" : cut !== null ? (cut === bomb.safe ? "✅" : "💥") : "💣"}</p>
            <p className="text-theme-muted text-sm mb-6">
              {exploded ? "BOOM! Time's up!" : cut !== null ? (cut === bomb.safe ? "Defused! +20" : "Wrong wire! 💥") : "Cut the safe wire!"}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {WIRES.map((w, i) => (
                <button key={i} onClick={() => cutWire(i)}
                  disabled={cut !== null || exploded}
                  className={`py-4 text-3xl rounded-xl border-2 transition-all
                    ${cut === i ? (i === bomb.safe ? "border-green-500 bg-green-500/20" : "border-red-500 bg-red-500/20") : "border-theme bg-theme-input hover:border-purple-400 hover:scale-105 active:scale-95"}
                    disabled:opacity-50`}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
