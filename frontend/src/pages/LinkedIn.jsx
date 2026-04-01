import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaLinkedin, FaBriefcase, FaUserFriends, FaHome, FaSearch,
  FaBell, FaThumbsUp, FaComment, FaShare, FaRetweet,
  FaMapMarkerAlt, FaGraduationCap, FaBuilding, FaEllipsisH,
  FaRegBookmark, FaBookmark, FaPaperPlane, FaUserPlus,
} from "react-icons/fa";
import {
  HiOutlineOfficeBuilding, HiOutlineAcademicCap, HiOutlineLocationMarker,
  HiOutlineBriefcase, HiDotsHorizontal, HiSearch, HiBell,
  HiOutlineChat, HiOutlineHome, HiOutlineUserGroup,
} from "react-icons/hi";

// ── Static Data ───────────────────────────────────────────────
const FEED_POSTS = [
  {
    id: 1,
    user: "Rahul Sharma", role: "Senior Software Engineer @ Google", time: "2h",
    avatar: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=0077b5&color=fff&bold=true&size=128",
    content: "Excited to share that I've just completed my AWS Solutions Architect certification! 🎉\n\nThe journey was challenging but incredibly rewarding. Key learnings:\n✅ Cloud architecture patterns\n✅ Cost optimization strategies\n✅ Security best practices\n\nIf you're considering cloud certifications, go for it! Happy to answer any questions.",
    likes: 342, comments: 48, reposts: 21, image: null,
    hashtags: ["#AWS", "#CloudComputing", "#Certification"],
  },
  {
    id: 2,
    user: "Priya Patel", role: "Product Manager @ Microsoft", time: "4h",
    avatar: "https://ui-avatars.com/api/?name=Priya+Patel&background=e91e63&color=fff&bold=true&size=128",
    content: "Just published my article on 'The Future of AI in Product Management' 🤖\n\nKey takeaway: AI won't replace PMs, but PMs who use AI will replace those who don't.\n\nLink in comments 👇",
    likes: 891, comments: 124, reposts: 67, image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=300&fit=crop",
    hashtags: ["#AI", "#ProductManagement", "#FutureOfWork"],
  },
  {
    id: 3,
    user: "Amit Kumar", role: "Full Stack Developer", time: "6h",
    avatar: "https://ui-avatars.com/api/?name=Amit+Kumar&background=4caf50&color=fff&bold=true&size=128",
    content: "🚀 #OpenToWork\n\nAfter 5 amazing years at my previous company, I'm looking for new opportunities in React/Node.js development.\n\nWhat I bring:\n• 5+ years React/Node.js\n• Team leadership experience\n• Startup & enterprise background\n\nDM me or check my profile!",
    likes: 567, comments: 89, reposts: 34, image: null,
    hashtags: ["#OpenToWork", "#ReactJS", "#NodeJS"],
    openToWork: true,
  },
  {
    id: 4,
    user: "Neha Joshi", role: "UX Designer @ Flipkart", time: "1d",
    avatar: "https://ui-avatars.com/api/?name=Neha+Joshi&background=9c27b0&color=fff&bold=true&size=128",
    content: "Design tip of the day 💡\n\nStop designing for yourself. Start designing for your users.\n\nThe best UX is invisible — users don't notice it because everything just works.\n\n#UXDesign #ProductDesign",
    likes: 1204, comments: 156, reposts: 89, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=300&fit=crop",
    hashtags: ["#UXDesign", "#ProductDesign"],
  },
];

const JOBS = [
  { id: 1, title: "Senior React Developer", company: "TechCorp India", location: "Bangalore · Hybrid", type: "Full-time", salary: "₹25–40 LPA", logo: "https://ui-avatars.com/api/?name=TC&background=0077b5&color=fff&bold=true", posted: "2d ago", applicants: 234, easy: true },
  { id: 2, title: "Product Manager", company: "StartupXYZ", location: "Remote", type: "Full-time", salary: "₹20–35 LPA", logo: "https://ui-avatars.com/api/?name=SX&background=e91e63&color=fff&bold=true", posted: "1d ago", applicants: 156, easy: true },
  { id: 3, title: "UI/UX Designer", company: "DesignStudio", location: "Mumbai · On-site", type: "Full-time", salary: "₹12–20 LPA", logo: "https://ui-avatars.com/api/?name=DS&background=4caf50&color=fff&bold=true", posted: "3d ago", applicants: 89, easy: false },
  { id: 4, title: "Data Scientist", company: "Analytics Co", location: "Hyderabad · Hybrid", type: "Full-time", salary: "₹18–30 LPA", logo: "https://ui-avatars.com/api/?name=AC&background=ff9800&color=fff&bold=true", posted: "5h ago", applicants: 412, easy: true },
  { id: 5, title: "DevOps Engineer", company: "CloudTech", location: "Pune · Remote", type: "Full-time", salary: "₹22–38 LPA", logo: "https://ui-avatars.com/api/?name=CT&background=9c27b0&color=fff&bold=true", posted: "1d ago", applicants: 178, easy: true },
  { id: 6, title: "Backend Engineer", company: "Zomato", location: "Gurgaon · Hybrid", type: "Full-time", salary: "₹28–45 LPA", logo: "https://ui-avatars.com/api/?name=ZO&background=e23744&color=fff&bold=true", posted: "12h ago", applicants: 521, easy: false },
];

const PEOPLE = [
  { name: "Sneha Gupta", role: "Frontend Developer @ Razorpay", mutual: 12, avatar: "https://ui-avatars.com/api/?name=Sneha+Gupta&background=0077b5&color=fff&bold=true" },
  { name: "Vikram Singh", role: "Backend Engineer @ Swiggy", mutual: 8, avatar: "https://ui-avatars.com/api/?name=Vikram+Singh&background=ff5722&color=fff&bold=true" },
  { name: "Ananya Roy", role: "Data Analyst @ Paytm", mutual: 5, avatar: "https://ui-avatars.com/api/?name=Ananya+Roy&background=4caf50&color=fff&bold=true" },
  { name: "Rohan Mehta", role: "Product Designer @ CRED", mutual: 15, avatar: "https://ui-avatars.com/api/?name=Rohan+Mehta&background=9c27b0&color=fff&bold=true" },
];

const fmtNum = (n) => n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);

// ── Post Card ─────────────────────────────────────────────────
function PostCard({ post, liked, onLike, saved, onSave }) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  return (
    <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <img src={post.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
            {post.openToWork && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-[#1b1f23] flex items-center justify-center">
                <span className="text-[7px] text-white font-bold">#</span>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-[14px] text-gray-900 dark:text-white leading-tight hover:text-blue-600 cursor-pointer">{post.user}</p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-tight">{post.role}</p>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
              <span>{post.time}</span>
              <span>·</span>
              <span>🌐</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-blue-600 text-[13px] font-semibold flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-full transition">
            <FaUserPlus size={13} /> Follow
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <FaEllipsisH size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[14px] text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{post.content}</p>
        {post.hashtags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map(h => (
              <span key={h} className="text-[13px] text-blue-600 hover:underline cursor-pointer">{h}</span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <img src={post.image} alt="" className="w-full max-h-[350px] object-cover" />
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-[12px] text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px]">👍</span>
            <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px]">❤️</span>
          </div>
          <span className="hover:underline cursor-pointer ml-1">{fmtNum(liked ? post.likes + 1 : post.likes)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:underline cursor-pointer">{post.comments} comments</span>
          <span className="hover:underline cursor-pointer">{post.reposts} reposts</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center px-2 py-1">
        {[
          { icon: <FaThumbsUp size={16} />, label: "Like", action: onLike, active: liked, color: "text-blue-600" },
          { icon: <FaComment size={16} />, label: "Comment", action: () => setShowComment(s => !s), active: false, color: "text-gray-500" },
          { icon: <FaRetweet size={16} />, label: "Repost", action: () => {}, active: false, color: "text-gray-500" },
          { icon: <FaPaperPlane size={16} />, label: "Send", action: () => {}, active: false, color: "text-gray-500" },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-700 ${btn.active ? btn.color : "text-gray-500 dark:text-gray-400"}`}>
            {btn.icon} <span className="hidden sm:inline">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Comment box */}
      {showComment && (
        <div className="px-4 pb-3 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 pt-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">U</div>
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 bg-transparent text-[13px] text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400" />
            {comment.trim() && (
              <button onClick={() => setComment("")} className="text-blue-600 font-semibold text-[13px]">Post</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function LinkedIn() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab,          setTab]          = useState("feed");
  const [likedPosts,   setLikedPosts]   = useState(new Set());
  const [savedPosts,   setSavedPosts]   = useState(new Set());
  const [appliedJobs,  setAppliedJobs]  = useState(new Set());
  const [savedJobs,    setSavedJobs]    = useState(new Set());
  const [connected,    setConnected]    = useState(new Set());
  const [searchQuery,  setSearchQuery]  = useState("");

  const toggleLike = (id) => setLikedPosts(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleSave = (id) => setSavedPosts(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const NAV_ITEMS = [
    { id: "feed",    icon: <HiOutlineHome size={22} />,      label: "Home" },
    { id: "network", icon: <HiOutlineUserGroup size={22} />, label: "My Network" },
    { id: "jobs",    icon: <HiOutlineBriefcase size={22} />, label: "Jobs" },
    { id: "msg",     icon: <HiOutlineChat size={22} />,      label: "Messaging" },
    { id: "notif",   icon: <HiBell size={22} />,             label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f2ef] dark:bg-[#1a1a1a] pb-[68px] md:pb-0">

      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-30 bg-white dark:bg-[#1b1f23] border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-full mx-auto px-4 flex items-center gap-2 h-14">
          {/* Logo */}
          <FaLinkedin className="text-[#0a66c2] flex-shrink-0" size={34} />

          {/* Search */}
          <div className="flex items-center gap-2 bg-[#eef3f8] dark:bg-gray-700 rounded-md px-3 py-2 flex-1 max-w-[280px]">
            <HiSearch className="text-gray-500 flex-shrink-0" size={16} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="bg-transparent text-[14px] text-gray-700 dark:text-gray-200 outline-none flex-1 placeholder:text-gray-500" />
          </div>

          {/* Nav items — desktop */}
          <nav className="hidden md:flex items-center ml-auto gap-1">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`flex flex-col items-center px-4 py-1 text-[11px] font-medium transition border-b-2 h-14 justify-center gap-0.5 ${
                  tab === item.id
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}>
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-600 mx-2" />
            <button onClick={() => navigate("/profile")} className="flex flex-col items-center px-3 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white h-14 justify-center gap-0.5">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=0077b5&color=fff`}
                className="w-6 h-6 rounded-full object-cover" alt="" />
              Me ▾
            </button>
          </nav>
        </div>

        {/* Mobile bottom tabs */}
        <div className="flex md:hidden border-t border-gray-100 dark:border-gray-700">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition ${
                tab === item.id ? "text-gray-900 dark:text-white" : "text-gray-400"
              }`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-full mx-auto px-4 pt-5 pb-8">
        <div className="flex gap-5 items-start">

          {/* ── Left Sidebar ── */}
          <aside className="hidden lg:block w-[225px] flex-shrink-0 space-y-3">
            {/* Profile card */}
            <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="h-16 bg-gradient-to-r from-[#0a66c2] to-[#0891b2]" />
              <div className="px-4 pb-4 -mt-8 text-center">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=0077b5&color=fff`}
                  className="w-16 h-16 rounded-full border-4 border-white dark:border-[#1b1f23] object-cover mx-auto" alt="" />
                <p className="font-bold text-[15px] text-gray-900 dark:text-white mt-2 leading-tight">{user?.name || user?.username}</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{user?.bio || "Add your headline"}</p>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-500 dark:text-gray-400">Profile viewers</span>
                  <span className="text-[#0a66c2] font-semibold">47</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-500 dark:text-gray-400">Post impressions</span>
                  <span className="text-[#0a66c2] font-semibold">1,284</span>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
                <p className="text-[12px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <FaBookmark size={12} className="text-[#0a66c2]" /> <span className="text-[#0a66c2] font-semibold">My items</span>
                </p>
              </div>
            </div>

            {/* Recent */}
            <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <p className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 mb-2">Recent</p>
              {["#ReactJS", "#ProductManagement", "#OpenToWork", "#AI"].map(tag => (
                <button key={tag} className="flex items-center gap-2 w-full py-1.5 text-[13px] text-gray-600 dark:text-gray-300 hover:text-[#0a66c2] transition">
                  <span className="text-gray-400">#</span> {tag.slice(1)}
                </button>
              ))}
            </div>
          </aside>

          {/* ── Center Feed ── */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* ── FEED TAB ── */}
            {tab === "feed" && (
              <>
                {/* Compose box */}
                <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=0077b5&color=fff`}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600" alt="" />
                    <button className="flex-1 text-left px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-[14px] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
                      Start a post
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {[
                      { icon: "🖼️", label: "Media" },
                      { icon: "📅", label: "Event" },
                      { icon: "📝", label: "Write article" },
                    ].map(item => (
                      <button key={item.label} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-1 justify-center">
                        <span>{item.icon}</span> {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Sort by: <span className="text-gray-900 dark:text-white font-semibold">Top</span> ▾</p>
                </div>

                {/* Posts */}
                {FEED_POSTS.map(post => (
                  <PostCard key={post.id} post={post}
                    liked={likedPosts.has(post.id)} onLike={() => toggleLike(post.id)}
                    saved={savedPosts.has(post.id)} onSave={() => toggleSave(post.id)} />
                ))}
              </>
            )}

            {/* ── JOBS TAB ── */}
            {tab === "jobs" && (
              <div className="space-y-3">
                {/* Search bar */}
                <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <p className="font-bold text-[18px] text-gray-900 dark:text-white mb-3">Find your next job</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
                      <HiSearch className="text-gray-400" size={16} />
                      <input placeholder="Job title or keyword" className="flex-1 bg-transparent text-[13px] outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400" />
                    </div>
                    <div className="flex-1 flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
                      <HiOutlineLocationMarker className="text-gray-400" size={16} />
                      <input placeholder="City, state, or remote" className="flex-1 bg-transparent text-[13px] outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400" />
                    </div>
                    <button className="bg-[#0a66c2] hover:bg-[#004182] text-white px-5 py-2 rounded-lg text-[14px] font-semibold transition">Search</button>
                  </div>
                </div>

                <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 px-1">Recommended for you</p>

                {JOBS.map(job => (
                  <div key={job.id} className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <img src={job.logo} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-[15px] text-[#0a66c2] hover:underline cursor-pointer leading-tight">{job.title}</p>
                            <p className="text-[13px] text-gray-700 dark:text-gray-300 mt-0.5">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} />{job.location}</span>
                              <span>{job.type}</span>
                            </div>
                            <p className="text-[12px] text-green-600 dark:text-green-400 font-semibold mt-1">{job.salary}</p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                              <span>{job.posted}</span>
                              <span>·</span>
                              <span>{job.applicants} applicants</span>
                              {job.easy && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">Easy Apply</span>}
                            </div>
                          </div>
                          <button onClick={() => setSavedJobs(p => { const s = new Set(p); s.has(job.id) ? s.delete(job.id) : s.add(job.id); return s; })}
                            className="text-gray-400 hover:text-[#0a66c2] transition p-1 flex-shrink-0">
                            {savedJobs.has(job.id) ? <FaBookmark size={16} className="text-[#0a66c2]" /> : <FaRegBookmark size={16} />}
                          </button>
                        </div>
                        <button onClick={() => setAppliedJobs(p => new Set([...p, job.id]))}
                          className={`mt-3 px-5 py-2 rounded-full text-[14px] font-semibold border-2 transition ${
                            appliedJobs.has(job.id)
                              ? "border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                              : "border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10"
                          }`}>
                          {appliedJobs.has(job.id) ? "✓ Applied" : job.easy ? "Easy Apply" : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── NETWORK TAB ── */}
            {tab === "network" && (
              <div className="space-y-3">
                <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <p className="font-bold text-[18px] text-gray-900 dark:text-white mb-1">Grow your network</p>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400">Connect with people you know to see their updates</p>
                </div>

                <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 px-1">People you may know</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PEOPLE.map((p, i) => (
                    <div key={i} className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-14 bg-gradient-to-r from-[#0a66c2]/30 to-[#0891b2]/30" />
                      <div className="px-4 pb-4 -mt-7 text-center">
                        <img src={p.avatar} className="w-14 h-14 rounded-full border-4 border-white dark:border-[#1b1f23] object-cover mx-auto" alt="" />
                        <p className="font-semibold text-[14px] text-gray-900 dark:text-white mt-2 leading-tight hover:text-[#0a66c2] cursor-pointer">{p.name}</p>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{p.role}</p>
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center justify-center gap-1">
                          <FaUserFriends size={10} /> {p.mutual} mutual connections
                        </p>
                        <button onClick={() => setConnected(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; })}
                          className={`mt-3 w-full py-1.5 rounded-full text-[14px] font-semibold border-2 transition ${
                            connected.has(i)
                              ? "border-gray-300 text-gray-500 dark:text-gray-400 dark:border-gray-600"
                              : "border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10"
                          }`}>
                          {connected.has(i) ? "Pending" : "+ Connect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MESSAGING TAB ── */}
            {tab === "msg" && (
              <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm text-center">
                <HiOutlineChat size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">Your messages</p>
                <p className="text-[13px] text-gray-400 mt-1">Use the Messages tab in the main app to chat</p>
                <button onClick={() => window.location.href = "/messages"}
                  className="mt-4 px-6 py-2 bg-[#0a66c2] text-white rounded-full text-[14px] font-semibold hover:bg-[#004182] transition">
                  Go to Messages
                </button>
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {tab === "notif" && (
              <div className="space-y-2">
                {[
                  { text: "Sneha Gupta liked your post", time: "2h", avatar: "https://ui-avatars.com/api/?name=SG&background=0077b5&color=fff" },
                  { text: "Vikram Singh commented: 'Great insights!'", time: "4h", avatar: "https://ui-avatars.com/api/?name=VS&background=ff5722&color=fff" },
                  { text: "Your post got 100+ reactions", time: "1d", avatar: null, icon: "🎉" },
                  { text: "Rohan Mehta sent you a connection request", time: "2d", avatar: "https://ui-avatars.com/api/?name=RM&background=9c27b0&color=fff" },
                ].map((n, i) => (
                  <div key={i} className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer">
                    {n.avatar
                      ? <img src={n.avatar} className="w-12 h-12 rounded-full object-cover flex-shrink-0" alt="" />
                      : <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl flex-shrink-0">{n.icon}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-gray-700 dark:text-gray-300">{n.text}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                    <div className="w-2.5 h-2.5 bg-[#0a66c2] rounded-full flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="hidden xl:block w-[300px] flex-shrink-0 space-y-3">
            {/* LinkedIn News */}
            <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <p className="font-bold text-[16px] text-gray-900 dark:text-white mb-3">LinkedIn News</p>
              {[
                { title: "AI reshaping tech hiring", reads: "45,231 readers", time: "2h ago" },
                { title: "Remote work trends 2026", reads: "32,100 readers", time: "4h ago" },
                { title: "Top skills employers want", reads: "28,450 readers", time: "6h ago" },
                { title: "Startup funding hits record", reads: "19,800 readers", time: "1d ago" },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 rounded-lg transition">
                  <span className="text-gray-400 font-bold text-[14px] flex-shrink-0 mt-0.5">·</span>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 hover:text-[#0a66c2] leading-tight">{n.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{n.time} · {n.reads}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ad */}
            <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm text-center">
              <p className="text-[11px] text-gray-400 mb-2">Promoted</p>
              <div className="w-full h-24 bg-gradient-to-r from-[#0a66c2] to-[#0891b2] rounded-lg flex items-center justify-center mb-3">
                <p className="text-white font-bold text-[15px]">LinkedIn Premium</p>
              </div>
              <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-3">Get 2x more profile views with Premium</p>
              <button className="w-full py-2 border-2 border-[#c7a84a] text-[#c7a84a] rounded-full text-[14px] font-semibold hover:bg-[#c7a84a]/10 transition">
                Try Premium free
              </button>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
