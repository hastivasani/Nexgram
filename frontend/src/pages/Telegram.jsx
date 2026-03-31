import { useState, useEffect, useRef } from "react";
import { FaTelegram, FaPaperPlane, FaSearch, FaVolumeUp, FaSmile, FaPaperclip, FaMicrophone } from "react-icons/fa";
import { HiArrowLeft, HiDotsVertical, HiPhone, HiVideoCamera } from "react-icons/hi";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import { searchUsers } from "../services/api";

const CHANNELS = [
  { id: "tech_news", name: "Tech News Daily", icon: "💻", type: "channel", members: 124500, lastMsg: "New iPhone 17 leaked specs!", time: "10:32", unread: 5 },
  { id: "crypto", name: "Crypto Signals", icon: "₿", type: "channel", members: 89200, lastMsg: "BTC breaking 70k resistance", time: "10:15", unread: 12 },
  { id: "sports", name: "Sports Live", icon: "⚽", type: "channel", members: 210000, lastMsg: "GOAL! 2-1 in 78th minute", time: "09:58", unread: 3 },
  { id: "memes", name: "Meme Zone", icon: "😂", type: "channel", members: 450000, lastMsg: "When code works first try", time: "09:45", unread: 0 },
  { id: "coding", name: "Dev Community", icon: "👨‍💻", type: "channel", members: 98000, lastMsg: "React 20 announced!", time: "08:55", unread: 8 },
  { id: "movies", name: "Movie Hub", icon: "🎬", type: "channel", members: 67000, lastMsg: "Avengers 5 trailer tomorrow!", time: "09:20", unread: 2 },
];

const CHANNEL_MSGS = {
  tech_news: [
    { id: 1, text: "Apple announces iPhone 17 with revolutionary AI chip", time: "09:00", views: 45200 },
    { id: 2, text: "Google DeepMind releases new AI model beating GPT-4 on all benchmarks", time: "09:30", views: 38100 },
    { id: 3, text: "New iPhone 17 leaked: 48MP camera, 8GB RAM, A19 chip", time: "10:32", views: 12400 },
  ],
  crypto: [
    { id: 1, text: "BTC Analysis: Strong support at $68,500. Next resistance: $72,000", time: "09:15", views: 28900 },
    { id: 2, text: "ETH showing bullish divergence on 4H chart. Target: $4,200", time: "09:45", views: 19200 },
    { id: 3, text: "BTC breaking resistance at 70k. Next stop $75k?", time: "10:15", views: 8900 },
  ],
  sports: [
    { id: 1, text: "LIVE: Manchester City vs Arsenal - 1-1 (65')", time: "09:30", views: 89000 },
    { id: 2, text: "RED CARD! Arsenal down to 10 men (72')", time: "09:52", views: 102000 },
    { id: 3, text: "GOAL! 2-1 in 78th minute. City takes the lead!", time: "09:58", views: 145000 },
  ],
  memes: [
    { id: 1, text: "When the code works on first try\n\n*surprised pikachu face*", time: "09:00", views: 234000 },
    { id: 2, text: "Me: I'll fix this bug in 5 minutes\nAlso me 3 hours later: crying", time: "09:20", views: 189000 },
  ],
  coding: [
    { id: 1, text: "React 20 announced!\n- Server Components by default\n- Built-in state management\n- 50% faster rendering", time: "08:30", views: 45000 },
    { id: 2, text: "TypeScript 6.0 beta released with major performance improvements", time: "08:55", views: 32000 },
  ],
  movies: [
    { id: 1, text: "Avengers 5 trailer drops tomorrow at 12 PM EST! Set your reminders!", time: "09:20", views: 67000 },
  ],
};

export default function Telegram() {
  const { user } = useAuth();
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [dmMessages, setDmMessages] = useState({});
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentDMs, setRecentDMs] = useState([]);
  const [tab, setTab] = useState("all");
  const messagesEndRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    socket.on("newMessage", (msg) => {
      const sid = msg.sender?._id || msg.sender;
      if (sid) setDmMessages(prev => ({ ...prev, [sid]: [...(prev[sid] || []), { ...msg, mine: false }] }));
    });
    return () => socket.off("newMessage");
  }, [user?._id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [dmMessages, selected]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try { const res = await searchUsers(search); setSearchResults(res.data || []); } catch (_) {}
    }, 300);
  }, [search]);

  const sendMessage = () => {
    if (!text.trim() || !selected) return;
    const msg = { id: Date.now(), text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), mine: true };
    const key = selected.id || selected._id;
    setDmMessages(prev => ({ ...prev, [key]: [...(prev[key] || []), msg] }));
    setText("");
    if (!selected.type && user?._id) {
      const socket = getSocket(user._id);
      socket.emit("sendMessage", { receiverId: selected._id, text: msg.text });
    }
  };

  const openChat = (item) => {
    setSelected(item);
    setView("chat");
    setSearch("");
    setSearchResults([]);
    if (!item.type && !recentDMs.find(d => d._id === item._id)) {
      setRecentDMs(prev => [item, ...prev]);
    }
  };

  const allChats = [
    ...CHANNELS,
    ...recentDMs.map(d => ({ ...d, id: d._id, type: "dm", lastMsg: dmMessages[d._id]?.slice(-1)[0]?.text || "No messages yet", time: "", unread: 0 })),
  ];

  const filtered = allChats.filter(c => {
    if (tab === "channels") return c.type === "channel";
    if (tab === "dms") return c.type === "dm";
    return true;
  });

  if (view === "chat" && selected) {
    const key = selected.id || selected._id;
    const msgs = selected.type === "channel" ? (CHANNEL_MSGS[selected.id] || []) : (dmMessages[key] || []);
    const isChannel = selected.type === "channel";
    return (
      <div className="flex flex-col h-[calc(100dvh-56px)] md:h-full" style={{ background: "#0e1621" }}>
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: "#17212b", borderBottom: "1px solid #0d1117" }}>
          <button onClick={() => setView("list")} className="text-gray-400 hover:text-white"><HiArrowLeft size={22} /></button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg,#2b5278,#1c3a5e)" }}>
            {selected.avatar ? <img src={selected.avatar} className="w-full h-full object-cover" alt="" /> : <span>{selected.icon || selected.username?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">{selected.name || selected.username}</p>
            <p className="text-xs text-gray-400">{isChannel ? `${selected.members?.toLocaleString()} subscribers` : "online"}</p>
          </div>
          <div className="flex gap-3 text-gray-400">
            {!isChannel && <><HiPhone size={20} className="cursor-pointer hover:text-white" /><HiVideoCamera size={20} className="cursor-pointer hover:text-white" /></>}
            <HiDotsVertical size={20} className="cursor-pointer hover:text-white" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide" style={{ background: "#0e1621" }}>
          {msgs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
              <FaTelegram size={48} className="text-blue-400 opacity-30" />
              <p className="text-sm">No messages yet</p>
            </div>
          )}
          {msgs.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%] px-3 py-2 text-sm" style={{ background: msg.mine ? "#2b5278" : "#182533", borderRadius: msg.mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px" }}>
                <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">{msg.time}</span>
                  {isChannel && msg.views && <span className="text-[10px] text-gray-400">👁 {(msg.views/1000).toFixed(1)}K</span>}
                  {msg.mine && <span className="text-[10px] text-blue-400">✓✓</span>}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {!isChannel ? (
          <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0" style={{ background: "#17212b" }}>
            <button className="text-gray-400 hover:text-white p-1"><FaSmile size={20} /></button>
            <button className="text-gray-400 hover:text-white p-1"><FaPaperclip size={18} /></button>
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Message" className="flex-1 rounded-full px-4 py-2 text-sm text-white outline-none"
              style={{ background: "#0d1117", border: "1px solid #2b3a4a" }} />
            {text.trim()
              ? <button onClick={sendMessage} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: "#2b5278" }}><FaPaperPlane size={14} /></button>
              : <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white"><FaMicrophone size={16} /></button>}
          </div>
        ) : (
          <div className="px-4 py-3 text-center text-xs text-gray-500 flex-shrink-0" style={{ background: "#17212b" }}>
            Channel — only admins can post
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] md:h-full relative" style={{ background: "#0e1621" }}>
      <div className="px-4 pt-4 pb-2 flex-shrink-0" style={{ background: "#17212b" }}>
        <div className="flex items-center gap-2 mb-3">
          <FaTelegram className="text-blue-400 text-2xl" />
          <h1 className="text-lg font-bold text-white">Telegram</h1>
          <button className="ml-auto p-2 rounded-full hover:bg-white/10 text-gray-400"><HiDotsVertical size={20} /></button>
        </div>
        <div className="relative flex items-center gap-2 rounded-xl px-3 py-2 mb-3" style={{ background: "#0d1117" }}>
          <FaSearch className="text-gray-500 text-sm flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500" />
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ background: "#17212b" }}>
              {searchResults.map(u => (
                <div key={u._id} onClick={() => openChat(u)} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer">
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=2b5278&color=fff`} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <p className="text-sm font-semibold text-white">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.name || "User"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {[["all","All"],["channels","Channels"],["dms","DMs"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition"
              style={{ background: tab === id ? "#2b5278" : "transparent", color: tab === id ? "#fff" : "#9ca3af" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filtered.map(chat => {
          const key = chat.id || chat._id;
          const lastDM = chat.type === "dm" ? dmMessages[key]?.slice(-1)[0]?.text : null;
          return (
            <div key={key} onClick={() => openChat(chat)} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="relative flex-shrink-0">
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#2b5278,#1c3a5e)" }}>
                  {chat.avatar ? <img src={chat.avatar} className="w-full h-full object-cover rounded-full" alt="" /> : <span>{chat.icon || chat.username?.[0]?.toUpperCase()}</span>}
                </div>
                {chat.type === "channel" && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#2b5278" }}>
                    <FaVolumeUp size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white text-sm truncate">{chat.name || chat.username}</p>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-gray-400 truncate">{lastDM || chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1" style={{ background: "#2b5278" }}>
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-20 md:bottom-6 right-4">
        <button onClick={() => setSearch(" ")} className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-105 transition" style={{ background: "#2b5278" }}>
          <FaPaperPlane size={20} />
        </button>
      </div>
    </div>
  );
}
