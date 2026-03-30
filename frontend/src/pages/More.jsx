import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineCog, HiOutlineChartBar, HiOutlineBookmark,
  HiOutlineMoon, HiSun, HiOutlineExclamationCircle,
  HiOutlineSwitchHorizontal, HiOutlineLogout, HiOutlineChat,
  HiOutlineGlobe, HiCamera, HiX, HiCheck, HiPlus,
} from "react-icons/hi";
import { FaGamepad, FaUsers, FaTwitter, FaShoppingBag, FaCalendarAlt, FaVideo, FaHeadphones, FaUserCircle } from "react-icons/fa";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthContext";
import { loginUser } from "../services/api";

const QUICK_LINKS = [
  { to: "/messages",    label: "Messages",    icon: HiOutlineChat },
  { to: "/camera",      label: "Camera",      icon: HiCamera },
  { to: "/explore",     label: "Explore",     icon: HiOutlineGlobe },
  { to: "/groups",      label: "Groups",      icon: FaUsers },
  { to: "/twitter",     label: "Twitter",     icon: FaTwitter },
  { to: "/gaming",      label: "Gaming",      icon: FaGamepad },
  { to: "/shop",        label: "Shop",        icon: FaShoppingBag },
  { to: "/booking",     label: "Booking",     icon: FaCalendarAlt },
  { to: "/video",       label: "Videos",      icon: FaVideo },
  { to: "/voice-rooms", label: "Voice Rooms", icon: FaHeadphones },
  { to: "/profile",     label: "Profile",     icon: FaUserCircle },
];

// ── Switch Accounts Modal ─────────────────────────────────────
function SwitchAccountsModal({ currentUser, onClose, onSwitch }) {
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Saved accounts in localStorage
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savedAccounts") || "[]"); } catch { return []; }
  });

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const newUser = res.data.user;
      const newToken = res.data.token;
      // Save to saved accounts
      const updated = [...savedAccounts.filter(a => a._id !== newUser._id), { ...newUser, token: newToken }];
      localStorage.setItem("savedAccounts", JSON.stringify(updated));
      setSavedAccounts(updated);
      setShowAdd(false);
      setEmail(""); setPassword("");
      onSwitch(newToken, newUser);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  const switchTo = (account) => {
    onSwitch(account.token, account);
  };

  const removeAccount = (id) => {
    const updated = savedAccounts.filter(a => a._id !== id);
    localStorage.setItem("savedAccounts", JSON.stringify(updated));
    setSavedAccounts(updated);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-sm bg-theme-card rounded-t-3xl md:rounded-2xl border border-theme shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-theme">
          <h2 className="text-base font-bold text-theme-primary">Switch accounts</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-theme-hover text-theme-muted"><HiX size={20} /></button>
        </div>

        {/* Current account */}
        <div className="px-5 py-3 border-b border-theme">
          <p className="text-xs text-theme-muted mb-2 uppercase tracking-wide font-semibold">Current</p>
          <div className="flex items-center gap-3">
            <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.username}&background=random`}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500" alt="" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-theme-primary text-sm">{currentUser?.username}</p>
              <p className="text-xs text-theme-muted truncate">{currentUser?.name || currentUser?.email}</p>
            </div>
            <HiCheck size={18} className="text-blue-500 flex-shrink-0" />
          </div>
        </div>

        {/* Saved accounts */}
        {savedAccounts.filter(a => a._id !== currentUser?._id).length > 0 && (
          <div className="px-5 py-3 border-b border-theme">
            <p className="text-xs text-theme-muted mb-2 uppercase tracking-wide font-semibold">Saved accounts</p>
            <div className="space-y-2">
              {savedAccounts.filter(a => a._id !== currentUser?._id).map(acc => (
                <div key={acc._id} className="flex items-center gap-3">
                  <button onClick={() => switchTo(acc)} className="flex items-center gap-3 flex-1 hover:bg-theme-hover rounded-xl p-1.5 transition-colors">
                    <img src={acc.avatar || `https://ui-avatars.com/api/?name=${acc.username}&background=random`}
                      className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-theme-primary text-sm">{acc.username}</p>
                      <p className="text-xs text-theme-muted">{acc.name}</p>
                    </div>
                  </button>
                  <button onClick={() => removeAccount(acc._id)} className="p-1.5 text-theme-muted hover:text-red-400 transition-colors">
                    <HiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add account */}
        {showAdd ? (
          <form onSubmit={handleAddAccount} className="px-5 py-4 space-y-3">
            <p className="text-sm font-semibold text-theme-primary">Add account</p>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Username or email"
              className="w-full bg-theme-input text-theme-primary rounded-xl px-4 py-2.5 text-sm outline-none border border-theme focus:border-purple-500 transition" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-theme-input text-theme-primary rounded-xl px-4 py-2.5 text-sm outline-none border border-theme focus:border-purple-500 transition" />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-theme text-theme-muted hover:bg-theme-hover transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50">
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-3 w-full px-5 py-4 hover:bg-theme-hover transition-colors text-blue-500">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <HiPlus size={18} />
            </div>
            <span className="font-semibold text-sm">Add account</span>
          </button>
        )}
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { to: "/messages",    label: "Messages",    icon: HiOutlineChat },
  { to: "/camera",      label: "Camera",      icon: HiCamera },
  { to: "/explore",     label: "Explore",     icon: HiOutlineGlobe },
  { to: "/groups",      label: "Groups",      icon: FaUsers },
  { to: "/twitter",     label: "Twitter",     icon: FaTwitter },
  { to: "/gaming",      label: "Gaming",      icon: FaGamepad },
  { to: "/shop",        label: "Shop",        icon: FaShoppingBag },
  { to: "/booking",     label: "Booking",     icon: FaCalendarAlt },
  { to: "/video",       label: "Videos",      icon: FaVideo },
  { to: "/voice-rooms", label: "Voice Rooms", icon: FaHeadphones },
  { to: "/profile",     label: "Profile",     icon: FaUserCircle },
];

export default function MorePopup({ openMore, onClose }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, login } = useAuth();
  const [showSwitch, setShowSwitch] = useState(false);

  if (!openMore) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const go = (path) => { onClose(); navigate(path); };

  const handleSwitch = (token, newUser) => {
    login(token, newUser);
    localStorage.setItem("selectedChat", "");
    setShowSwitch(false);
    onClose();
    navigate("/");
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="fixed bottom-16 left-0 right-0 md:bottom-24 md:left-20 md:right-auto md:w-72 bg-theme-card border border-theme text-theme-primary rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto">

        {/* Quick Nav Links - only visible on mobile */}
        <div className="md:hidden px-4 pt-4 pb-2">
          <p className="text-xs text-theme-secondary font-semibold uppercase tracking-wider mb-3">Quick Access</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <button key={link.to} onClick={() => go(link.to)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-theme-hover transition-colors">
                  <Icon size={20} className="text-purple-400" />
                  <span className="text-[10px] text-theme-secondary leading-tight text-center">{link.label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-px bg-theme-secondary mb-2" />
        </div>

        <button onClick={() => go("/settings")} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineCog size={22} />
          <span>Settings</span>
        </button>

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineChartBar size={22} />
          <span>Your activity</span>
        </button>

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineBookmark size={22} />
          <span>Saved</span>
        </button>

        <button onClick={toggleTheme} className="flex items-center justify-between w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <div className="flex items-center gap-3">
            {isDark ? <HiSun size={22} className="text-yellow-400" /> : <HiOutlineMoon size={22} />}
            <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
          </div>
          <div className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors duration-300 flex-shrink-0 pointer-events-none ${isDark ? "bg-blue-500 justify-end" : "bg-gray-400 justify-start"}`}>
            <div className="w-5 h-5 bg-white rounded-full shadow-md" />
          </div>
        </button>

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineExclamationCircle size={22} />
          <span>Report a problem</span>
        </button>

        <div className="h-[6px] bg-theme-secondary" />

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Threads_%28app%29_logo.svg" className="w-5 h-5" alt="Threads" />
          <span>Threads</span>
        </button>

        <div className="h-[6px] bg-theme-secondary" />

        <button onClick={() => setShowSwitch(true)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineSwitchHorizontal size={22} />
          <span>Switch accounts</span>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-red-500">
          <HiOutlineLogout size={22} />
          <span>Log out</span>
        </button>
      </div>

      {showSwitch && (
        <SwitchAccountsModal
          currentUser={user}
          onClose={() => setShowSwitch(false)}
          onSwitch={handleSwitch}
        />
      )}
    </>
  );
}
