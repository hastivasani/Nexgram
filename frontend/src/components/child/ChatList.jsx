import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getConversationList, deleteConversation as deleteConvAPI } from "../../services/api";
import { useAuth } from "../../Context/AuthContext";
import { getSocket } from "../../utils/socket";
import { BsThreeDots } from "react-icons/bs";
import { FaThumbtack, FaTrash, FaBellSlash, FaBell } from "react-icons/fa";
import { MdMarkChatUnread } from "react-icons/md";

export default function ChatList({ onSelectChat, selectedUserId, onDeleteChat }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [pinnedIds, setPinnedIds] = useState(() => JSON.parse(localStorage.getItem("pinnedChats") || "[]"));
  const [mutedIds, setMutedIds] = useState(() => JSON.parse(localStorage.getItem("mutedChats") || "[]"));
  const [unreadIds, setUnreadIds] = useState(() => JSON.parse(localStorage.getItem("unreadChats") || "[]"));
  const menuRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await getConversationList();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    const handleNew = () => fetchConversations();
    socket.on("newMessage", handleNew);
    // Also refresh when current user sends a message
    window.addEventListener("messageSent", handleNew);
    return () => {
      socket.off("newMessage", handleNew);
      window.removeEventListener("messageSent", handleNew);
    };
  }, [user?._id]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const togglePin = (id) => {
    const updated = pinnedIds.includes(id) ? pinnedIds.filter(x => x !== id) : [...pinnedIds, id];
    setPinnedIds(updated);
    localStorage.setItem("pinnedChats", JSON.stringify(updated));
    setMenuOpenId(null);
  };

  const toggleMute = (id) => {
    const updated = mutedIds.includes(id) ? mutedIds.filter(x => x !== id) : [...mutedIds, id];
    setMutedIds(updated);
    localStorage.setItem("mutedChats", JSON.stringify(updated));
    setMenuOpenId(null);
  };

  const markUnread = (id) => {
    const updated = unreadIds.includes(id) ? unreadIds.filter(x => x !== id) : [...unreadIds, id];
    setUnreadIds(updated);
    localStorage.setItem("unreadChats", JSON.stringify(updated));
    setMenuOpenId(null);
  };

  const deleteConversation = async (id) => {
    // Optimistically remove from UI immediately
    setConversations(prev => prev.filter(c => c.user._id !== id));
    setMenuOpenId(null);
    onDeleteChat?.();
    try {
      await deleteConvAPI(id);
    } catch (err) {
      console.error("Delete conversation failed", err);
      // Refresh to restore if API failed
      fetchConversations();
    }
  };

  // Sort: pinned first
  const sorted = [...conversations].sort((a, b) => {
    const aPin = pinnedIds.includes(a.user._id) ? 1 : 0;
    const bPin = pinnedIds.includes(b.user._id) ? 1 : 0;
    return bPin - aPin;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading && (
          <div className="space-y-1 px-2 pt-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-theme-secondary flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-theme-secondary rounded w-1/2" />
                  <div className="h-2 bg-theme-secondary rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-theme-secondary flex items-center justify-center text-3xl">💬</div>
            <p className="font-semibold text-theme-primary text-sm">No messages yet</p>
            <p className="text-theme-muted text-xs">Start a conversation with someone you follow.</p>
          </div>
        )}
        {sorted.map((conv) => {
          const other = conv.user;
          const isSelected = selectedUserId === other._id;
          const isPinned = pinnedIds.includes(other._id);
          const isMuted = mutedIds.includes(other._id);
          const isUnread = unreadIds.includes(other._id) || conv.unread > 0;
          const isMenuOpen = menuOpenId === other._id;

          return (
            <div
              key={other._id}
              className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                isSelected ? "bg-theme-hover" : "hover:bg-theme-hover"
              }`}
              onClick={() => onSelectChat(other)}
            >
              {/* Pin indicator */}
              {isPinned && (
                <span className="absolute top-1 right-2 text-yellow-400 text-[10px]">
                  <FaThumbtack className="rotate-45" />
                </span>
              )}

              <div className="relative flex-shrink-0">
                <img
                  src={other.avatar || `https://ui-avatars.com/api/?name=${other.username}`}
                  alt={other.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${isUnread ? "font-bold text-theme-primary" : "font-semibold text-theme-primary"}`}>
                    {other.username}
                    {isMuted && <span className="ml-1 text-theme-muted text-[10px]">🔇</span>}
                  </p>
                  {conv.lastMessage && (
                    <span className="text-[11px] text-theme-muted flex-shrink-0">
                      {timeAgo(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate mt-0.5 ${isUnread ? "font-semibold text-theme-primary" : "text-theme-muted"}`}>
                  {conv.lastMessage?.text
                    || (conv.lastMessage?.imageUrl ? "📷 Photo" : "")
                    || "No messages yet"}
                </p>
              </div>

              {isUnread && !isMenuOpen && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0" />
              )}

              {/* 3-dot button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMenuOpen) { setMenuOpenId(null); return; }
                  const rect = e.currentTarget.getBoundingClientRect();
                  const dropdownHeight = 176; // ~4 items * 44px
                  const spaceBelow = window.innerHeight - rect.bottom;
                  const top = spaceBelow < dropdownHeight
                    ? rect.top - dropdownHeight - 4
                    : rect.bottom + 4;
                  setMenuPos({ x: rect.right, y: top });
                  setMenuOpenId(other._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-primary transition-all flex-shrink-0"
              >
                <BsThreeDots size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Portal dropdown - renders outside all overflow containers */}
      {menuOpenId && (() => {
        const conv = conversations.find(c => c.user._id === menuOpenId);
        if (!conv) return null;
        const other = conv.user;
        const isPinned = pinnedIds.includes(other._id);
        const isMuted = mutedIds.includes(other._id);
        return createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", left: menuPos.x - 192, top: menuPos.y }}
            className="z-[9999] w-48 rounded-xl bg-[#1e1e1e] border border-white/10 shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => markUnread(other._id)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
            >
              <span>Mark as unread</span>
              <MdMarkChatUnread size={17} className="text-gray-300" />
            </button>
            <button
              onClick={() => togglePin(other._id)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
            >
              <span>{isPinned ? "Unpin" : "Pin"}</span>
              <FaThumbtack size={15} className="text-gray-300" />
            </button>
            <button
              onClick={() => toggleMute(other._id)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
            >
              <span>{isMuted ? "Unmute" : "Mute"}</span>
              {isMuted
                ? <FaBell size={15} className="text-gray-300" />
                : <FaBellSlash size={15} className="text-gray-300" />
              }
            </button>
            <button
              onClick={() => deleteConversation(other._id)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
            >
              <span>Delete</span>
              <FaTrash size={14} className="text-red-400" />
            </button>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
