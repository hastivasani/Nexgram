import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { HiOutlineX, HiCheck, HiX } from "react-icons/hi";
import { getNotifications, markAllRead, acceptFollow, rejectFollow, followUser } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";

export default function NotificationsPanel({ open, setOpen }) {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const isPage = location.pathname === "/notifications";

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [filter,        setFilter]        = useState("all");
  const [localState,    setLocalState]    = useState({});

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
      setLocalState({});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (open || isPage) {
      fetchNotifications();
      markAllRead().catch(() => {});
    }
  }, [open, isPage, fetchNotifications]);

  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    const handleNew = (n) => setNotifications((prev) => [n, ...prev]);
    socket.on("newNotification", handleNew);
    return () => socket.off("newNotification", handleNew);
  }, [user?._id]);

  const isAlreadyFollower = (senderId) =>
    user?.followers?.some((f) => (f._id || f)?.toString() === senderId?.toString());
  const isAlreadyFollowing = (senderId) =>
    user?.following?.some((f) => (f._id || f)?.toString() === senderId?.toString());

  const handleAccept = async (senderId, notifId) => {
    try {
      await acceptFollow(senderId);
      setLocalState((prev) => ({ ...prev, [notifId]: "accepted" }));
      await refreshUser();
    } catch (err) {
      if (err?.response?.status === 400) setLocalState((prev) => ({ ...prev, [notifId]: "accepted" }));
      else console.error(err);
    }
  };

  const handleReject = async (senderId, notifId) => {
    try {
      await rejectFollow(senderId);
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
    } catch (err) { console.error(err); }
  };

  const handleFollowBack = async (senderId, notifId) => {
    try {
      await followUser(senderId);
      setLocalState((prev) => ({ ...prev, [notifId]: "followback_done" }));
      await refreshUser();
    } catch (err) { console.error(err); }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getText = (n) => {
    switch (n.type) {
      case "like":           return "liked your post.";
      case "comment":        return "commented on your post.";
      case "follow":         return "started following you.";
      case "follow_request": return "sent you a follow request.";
      case "message":        return "sent you a message.";
      default:               return "";
    }
  };

  const filterTabs = ["all", "follow_request", "follow", "like", "comment"];
  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  const renderAction = (item) => {
    const senderId = item.sender?._id;
    const override = localState[item._id];
    if (override === "followback_done") return <span className="text-xs text-green-500 font-semibold">Following</span>;
    const accepted = override === "accepted" || isAlreadyFollower(senderId);
    if (item.type === "follow_request") {
      if (accepted) {
        if (isAlreadyFollowing(senderId)) return <span className="text-xs text-green-500 font-semibold">Following</span>;
        return (
          <button onClick={() => handleFollowBack(senderId, item._id)} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            Follow back
          </button>
        );
      }
      return (
        <div className="flex gap-2">
          <button onClick={() => handleAccept(senderId, item._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            <HiCheck size={14} /> Accept
          </button>
          <button onClick={() => handleReject(senderId, item._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-hover transition font-semibold">
            <HiX size={14} /> Reject
          </button>
        </div>
      );
    }
    if ((item.type === "like" || item.type === "comment") && item.post?.mediaUrl)
      return <img src={item.post.mediaUrl} alt="post" className="w-10 h-10 rounded object-cover" />;
    if (item.type === "follow")
      return <span className="text-xs text-theme-muted">Following you</span>;
    return null;
  };

  // ── Shared inner content ──────────────────────────────────────
  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-theme flex-shrink-0">
        <h2 className="text-xl font-semibold text-theme-primary">Notifications</h2>
        {!isPage && (
          <button onClick={() => setOpen(false)} className="p-2 bg-theme-hover rounded-full">
            <HiOutlineX size={22} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-5 py-3 flex-shrink-0 overflow-x-auto scrollbar-hide">
        {filterTabs.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-full capitalize whitespace-nowrap transition-colors flex-shrink-0 ${
              filter === f ? "bg-gray-800 text-white" : "border border-theme text-theme-secondary hover:bg-theme-hover"
            }`}
          >
            {f === "follow_request" ? "Requests" : f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading && <div className="text-center text-theme-muted py-10">Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-theme-muted py-10">No notifications yet.</div>
        )}
        {!loading && filtered.map((item) => (
          <div
            key={item._id}
            className={`flex items-center justify-between gap-3 px-5 py-3 hover:bg-theme-hover transition ${!item.read ? "border-l-2 border-blue-500" : ""}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={item.sender?.avatar || `https://ui-avatars.com/api/?name=${item.sender?.username || "U"}`}
                alt={item.sender?.username}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              />
              <div className="text-sm min-w-0">
                <span className="font-semibold text-theme-primary">{item.sender?.username}</span>{" "}
                <span className="text-theme-secondary">{getText(item)}</span>
                <span className="text-theme-muted ml-1 text-xs block">{timeAgo(item.createdAt)}</span>
              </div>
            </div>
            <div className="flex-shrink-0">{renderAction(item)}</div>
          </div>
        ))}
      </div>
    </>
  );

  // ── Page mode (route /notifications) ─────────────────────────
  if (isPage) {
    return (
      <div className="flex flex-col h-screen bg-theme-panel text-theme-primary pb-16 md:pb-0">
        {content}
      </div>
    );
  }

  // ── Drawer/panel mode (opened from sidebar bell icon) ────────
  return (
    <>
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-40" />}
      <div className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[380px] bg-theme-panel text-theme-primary shadow-xl z-50 flex flex-col transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        {content}
      </div>
    </>
  );
}
