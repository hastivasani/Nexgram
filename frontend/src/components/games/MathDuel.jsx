import { useState, useEffect, useRef } from "react";

function genQ() {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 20) + 1;
  if (op === "-" && b > a) [a, b] = [b, a];
  const ans = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const wrong = [ans + Math.floor(Math.random()*5)+1, ans - Math.floor(Math.random()*5)-1, ans + Math.floor(Math.random()*10)+2];
  const opts = [...new Set([ans, ...wrong])].slice(0,4).sort(() => Math.random()-0.5);
  return { q: `${a} ${op} ${b}`, ans, opts };
}

const ROUNDS = 7;

export default function MathDuel({ onGameEnd, lobbyId, players, currentUser, socket }) {
  const isSolo = !players || players.length < 2;
  const [question, setQuestion] = useState(null);
  const [scores, setScores] = useState({});
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);
  const myId = currentUser?._id;
  const opponent = players?.find(p => (p.user?._id || p.user)?.toString() !== myId?.toString());

  const nextQ = (r) => {
    const q = genQ();
    setQuestion(q);
    setFeedback("");
    setLocked(false);
    setRound(r);
    if (!isSolo && socket) socket.emit("gameAction", { lobbyId, action: "md_question", payload: { round: r, ...q } });
  };

  useEffect(() => { nextQ(1); }, []);

  useEffect(() => {
    if (!socket || isSolo) return;
    const onAction = ({ action, payload }) => {
      if (action === "md_question") { setQuestion({ q: payload.q, ans: payload.ans, opts: payload.opts }); setRound(payload.round); setFeedback(""); setLocked(false); }
      if (action === "md_answer") {
        setScores(prev => ({ ...prev, [payload.userId]: (prev[payload.userId] || 0) + payload.pts }));
        setFeedback(`${payload.username}: ${payload.correct ? "✅" : "❌"}`);
        setLocked(true);
        timerRef.current = setTimeout(() => {
          if (payload.round >= ROUNDS) setDone(true);
          else nextQ(payload.round + 1);
        }, 1000);
      }
    };
    socket.on("gameAction", onAction);
    return () => { socket.off("gameAction", onAction); clearTimeout(timerRef.current); };
  }, [socket, isSolo, question]);

  const handleAnswer = (opt) => {
    if (locked || done || !question) return;
    const correct = opt === question.ans;
    const pts = correct ? 10 : 0;
    setScores(prev => ({ ...prev, [myId]: (prev[myId] || 0) + pts }));
    setFeedback(correct ? "✅ Correct! +10" : `❌ Answer: ${question.ans}`);
    setLocked(true);
    if (!isSolo && socket) socket.emit("gameAction", { lobbyId, action: "md_answer", payload: { userId: myId, username: currentUser.username, pts, correct, round } });
    timerRef.current = setTimeout(() => {
      if (round >= ROUNDS) setDone(true);
      else nextQ(round + 1);
    }, 1000);
  };

  const myScore = scores[myId] || 0;
  const oppScore = scores[opponent?.user?._id || "opp"] || 0;

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">⚡ Math Duel</h2>
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
              <button onClick={() => { setScores({}); setDone(false); nextQ(1); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : question && (
          <>
            <div className="text-center bg-theme-card rounded-2xl p-8 border border-theme mb-6">
              <p className="text-5xl font-black text-theme-primary mb-2">{question.q} = ?</p>
              {feedback && <p className="text-sm font-bold mt-2">{feedback}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {question.opts.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)}
                  className="py-5 text-2xl font-black rounded-2xl bg-theme-card border-2 border-theme hover:border-purple-400 hover:bg-purple-500/10 transition-all active:scale-95">
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
