import { useState } from "react";
import { FaLinkedin, FaBriefcase, FaUserTie, FaGraduationCap, FaMapMarkerAlt, FaThumbsUp, FaComment, FaShare } from "react-icons/fa";
import { HiSearch, HiBell } from "react-icons/hi";
import { useAuth } from "../Context/AuthContext";

const FEED_POSTS = [
  { id: 1, user: "Rahul Sharma", role: "Senior Software Engineer @ Google", avatar: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=0077b5&color=fff", time: "2h", content: "Excited to share that I've just completed my AWS Solutions Architect certification! 🎉 The journey was challenging but incredibly rewarding. If you're considering cloud certifications, go for it!", likes: 342, comments: 48, image: null },
  { id: 2, user: "Priya Patel", role: "Product Manager @ Microsoft", avatar: "https://ui-avatars.com/api/?name=Priya+Patel&background=0077b5&color=fff", time: "4h", content: "Just published my article on 'The Future of AI in Product Management'. Key takeaway: AI won't replace PMs, but PMs who use AI will replace those who don't. Link in comments 👇", likes: 891, comments: 124, image: null },
  { id: 3, user: "Amit Kumar", role: "Full Stack Developer", avatar: "https://ui-avatars.com/api/?name=Amit+Kumar&background=0077b5&color=fff", time: "6h", content: "🚀 Open to work! After 5 amazing years at my previous company, I'm looking for new opportunities in React/Node.js development. DM me or check my profile!", likes: 567, comments: 89, image: null },
];

const JOBS = [
  { id: 1, title: "Senior React Developer", company: "TechCorp India", location: "Bangalore, India", type: "Full-time", salary: "₹25-40 LPA", logo: "https://ui-avatars.com/api/?name=TC&background=0077b5&color=fff", posted: "2d ago", applicants: 234 },
  { id: 2, title: "Product Manager", company: "StartupXYZ", location: "Remote", type: "Full-time", salary: "₹20-35 LPA", logo: "https://ui-avatars.com/api/?name=SX&background=e91e63&color=fff", posted: "1d ago", applicants: 156 },
  { id: 3, title: "UI/UX Designer", company: "DesignStudio", location: "Mumbai, India", type: "Full-time", salary: "₹12-20 LPA", logo: "https://ui-avatars.com/api/?name=DS&background=4caf50&color=fff", posted: "3d ago", applicants: 89 },
  { id: 4, title: "Data Scientist", company: "Analytics Co", location: "Hyderabad, India", type: "Full-time", salary: "₹18-30 LPA", logo: "https://ui-avatars.com/api/?name=AC&background=ff9800&color=fff", posted: "5h ago", applicants: 412 },
  { id: 5, title: "DevOps Engineer", company: "CloudTech", location: "Pune, India", type: "Full-time", salary: "₹22-38 LPA", logo: "https://ui-avatars.com/api/?name=CT&background=9c27b0&color=fff", posted: "1d ago", applicants: 178 },
];

const PEOPLE = [
  { name: "Sneha Gupta", role: "Frontend Developer", mutual: 12, avatar: "https://ui-avatars.com/api/?name=Sneha+Gupta&background=random" },
  { name: "Vikram Singh", role: "Backend Engineer", mutual: 8, avatar: "https://ui-avatars.com/api/?name=Vikram+Singh&background=random" },
  { name: "Ananya Roy", role: "Data Analyst", mutual: 5, avatar: "https://ui-avatars.com/api/?name=Ananya+Roy&background=random" },
];

export default function LinkedIn() {
  const { user } = useAuth();
  const [tab, setTab] = useState("feed");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <FaLinkedin className="text-blue-600 text-2xl flex-shrink-0" />
          <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <HiSearch className="text-gray-400" />
            <input placeholder="Search" className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400" />
          </div>
          <HiBell className="text-gray-500 dark:text-gray-400" size={22} />
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-3 max-w-2xl mx-auto">
          {[["feed","Feed"],["jobs","Jobs"],["network","Network"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${tab === id ? "bg-blue-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Profile card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-16 bg-gradient-to-r from-blue-600 to-cyan-500" />
          <div className="px-4 pb-4 -mt-8">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=0077b5&color=fff`}
              className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 object-cover" alt="" />
            <p className="font-bold text-gray-900 dark:text-white mt-1">{user?.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add your headline</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1"><FaMapMarkerAlt size={10} /> India</div>
          </div>
        </div>

        {/* Feed */}
        {tab === "feed" && FEED_POSTS.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <img src={post.avatar} className="w-11 h-11 rounded-full object-cover" alt="" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{post.user}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{post.role}</p>
                <p className="text-xs text-gray-400">{post.time}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
              <span>👍 {likedPosts.has(post.id) ? post.likes + 1 : post.likes}</span>
              <span className="ml-auto">{post.comments} comments</span>
            </div>
            <div className="flex border-t border-gray-100 dark:border-gray-700 pt-2 gap-1">
              {[
                { icon: <FaThumbsUp size={14} />, label: "Like", action: () => setLikedPosts(p => { const s = new Set(p); s.has(post.id) ? s.delete(post.id) : s.add(post.id); return s; }), active: likedPosts.has(post.id) },
                { icon: <FaComment size={14} />, label: "Comment", action: () => {} },
                { icon: <FaShare size={14} />, label: "Share", action: () => {} },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${btn.active ? "text-blue-600" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Jobs */}
        {tab === "jobs" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recommended Jobs</p>
            {JOBS.map(job => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <img src={job.logo} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{job.company}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FaMapMarkerAlt size={9} />{job.location}</span>
                      <span>{job.type}</span>
                    </div>
                    <p className="text-xs text-green-600 font-semibold mt-1">{job.salary}</p>
                    <p className="text-xs text-gray-400 mt-1">{job.applicants} applicants · {job.posted}</p>
                  </div>
                </div>
                <button onClick={() => setAppliedJobs(p => new Set([...p, job.id]))}
                  className={`mt-3 w-full py-2 rounded-xl text-sm font-semibold transition ${appliedJobs.has(job.id) ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                  {appliedJobs.has(job.id) ? "✓ Applied" : "Easy Apply"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Network */}
        {tab === "network" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">People you may know</p>
            {PEOPLE.map((p, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <img src={p.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.role}</p>
                  <p className="text-xs text-gray-400">{p.mutual} mutual connections</p>
                </div>
                <button className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-full text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
