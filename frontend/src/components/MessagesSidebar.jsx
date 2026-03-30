import { useState, useEffect, useRef } from "react";
import NotesBar from "./child/NotesBar";
import ChatList from "./child/ChatList";
import { HiOutlinePencilAlt, HiChevronDown } from "react-icons/hi";
import { useAuth } from "../Context/AuthContext";
import { searchUsers } from "../services/api";

export default function MessagesSidebar({ onSelectChat, selectedUserId, onDeleteChat }) {
  const { user } = useAuth();
  const username = user?.username || "username";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchUsers(query.trim());
        setResults(res.data || []);
      } catch (_) {}
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (u) => {
    onSelectChat(u);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="w-full flex flex-col h-full bg-theme-sidebar">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-theme flex-shrink-0">
        <div className="flex items-center gap-1">
          <h2 className="font-bold text-lg text-theme-primary">{username}</h2>
          <HiChevronDown size={18} className="text-theme-secondary" />
        </div>
        <button className="p-2 hover:bg-theme-hover rounded-full transition">
          <HiOutlinePencilAlt size={22} className="text-theme-primary" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 flex-shrink-0 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full bg-theme-input text-theme-primary rounded-xl px-4 py-2.5 outline-none placeholder:text-theme-muted text-sm border border-theme focus:border-gray-400 transition"
        />

        {/* Search results dropdown */}
        {query.trim() && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-theme-card border border-theme rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto scrollbar-hide">
            {searching && (
              <div className="px-4 py-3 text-sm text-theme-muted">Searching...</div>
            )}
            {!searching && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-theme-muted">No users found</div>
            )}
            {results.map((u) => (
              <div
                key={u._id}
                onClick={() => handleSelect(u)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-theme-hover cursor-pointer transition-colors"
              >
                <img
                  src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-theme-primary truncate">{u.username}</p>
                  {u.name && <p className="text-xs text-theme-muted truncate">{u.name}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes bar */}
      <div className="flex-shrink-0">
        <NotesBar />
      </div>

      {/* Chat list — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <ChatList onSelectChat={onSelectChat} selectedUserId={selectedUserId} onDeleteChat={onDeleteChat} />
      </div>

    </div>
  );
}
