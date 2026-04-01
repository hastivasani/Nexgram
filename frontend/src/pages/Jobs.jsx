import { useState } from "react";
import { FaBriefcase, FaMapMarkerAlt, FaRupeeSign, FaSearch, FaFilter, FaBookmark, FaBuilding } from "react-icons/fa";
import { HiClock, HiOfficeBuilding } from "react-icons/hi";

const ALL_JOBS = [
  { id: 1, title: "Senior React Developer", company: "TechCorp India", location: "Bangalore", type: "Full-time", salary: "₹25-40 LPA", category: "Engineering", logo: "https://ui-avatars.com/api/?name=TC&background=6366f1&color=fff", posted: "2d ago", applicants: 234, skills: ["React", "Node.js", "TypeScript"], remote: true },
  { id: 2, title: "Product Manager", company: "StartupXYZ", location: "Remote", type: "Full-time", salary: "₹20-35 LPA", category: "Product", logo: "https://ui-avatars.com/api/?name=SX&background=e91e63&color=fff", posted: "1d ago", applicants: 156, skills: ["Agile", "Roadmapping", "Analytics"], remote: true },
  { id: 3, title: "UI/UX Designer", company: "DesignStudio", location: "Mumbai", type: "Full-time", salary: "₹12-20 LPA", category: "Design", logo: "https://ui-avatars.com/api/?name=DS&background=4caf50&color=fff", posted: "3d ago", applicants: 89, skills: ["Figma", "Sketch", "Prototyping"], remote: false },
  { id: 4, title: "Data Scientist", company: "Analytics Co", location: "Hyderabad", type: "Full-time", salary: "₹18-30 LPA", category: "Data", logo: "https://ui-avatars.com/api/?name=AC&background=ff9800&color=fff", posted: "5h ago", applicants: 412, skills: ["Python", "ML", "TensorFlow"], remote: false },
  { id: 5, title: "DevOps Engineer", company: "CloudTech", location: "Pune", type: "Full-time", salary: "₹22-38 LPA", category: "Engineering", logo: "https://ui-avatars.com/api/?name=CT&background=9c27b0&color=fff", posted: "1d ago", applicants: 178, skills: ["AWS", "Docker", "Kubernetes"], remote: true },
  { id: 6, title: "Android Developer", company: "MobileFirst", location: "Delhi", type: "Full-time", salary: "₹15-25 LPA", category: "Engineering", logo: "https://ui-avatars.com/api/?name=MF&background=00bcd4&color=fff", posted: "4d ago", applicants: 67, skills: ["Kotlin", "Java", "Android SDK"], remote: false },
  { id: 7, title: "Content Writer", company: "MediaHouse", location: "Remote", type: "Part-time", salary: "₹5-10 LPA", category: "Marketing", logo: "https://ui-avatars.com/api/?name=MH&background=f44336&color=fff", posted: "6h ago", applicants: 321, skills: ["SEO", "Copywriting", "WordPress"], remote: true },
  { id: 8, title: "Business Analyst", company: "ConsultFirm", location: "Chennai", type: "Full-time", salary: "₹14-22 LPA", category: "Business", logo: "https://ui-avatars.com/api/?name=CF&background=607d8b&color=fff", posted: "2d ago", applicants: 145, skills: ["Excel", "SQL", "Power BI"], remote: false },
];

const CATEGORIES = ["All", "Engineering", "Product", "Design", "Data", "Marketing", "Business"];

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [saved, setSaved] = useState(new Set());
  const [applied, setApplied] = useState(new Set());
  const [selected, setSelected] = useState(null);

  const filtered = ALL_JOBS.filter(j => {
    const matchCat = category === "All" || j.category === category;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()) || j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchRemote = !remoteOnly || j.remote;
    return matchCat && matchSearch && matchRemote;
  });

  return (
    <div className="min-h-screen bg-theme-primary pb-[68px] md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-theme-primary/90 backdrop-blur border-b border-theme px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <FaBriefcase className="text-purple-500 text-xl" />
          <h1 className="text-lg font-bold text-theme-primary">Jobs</h1>
          <span className="ml-auto text-xs text-theme-muted bg-theme-secondary px-2 py-1 rounded-full">{filtered.length} jobs</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-theme-input rounded-xl px-3 py-2 border border-theme">
            <FaSearch className="text-theme-muted text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Job title, company, skills..."
              className="flex-1 bg-transparent text-theme-primary text-sm outline-none placeholder:text-theme-muted" />
          </div>
          <button onClick={() => setRemoteOnly(p => !p)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${remoteOnly ? "bg-purple-600 text-white border-purple-600" : "border-theme text-theme-muted hover:bg-theme-hover"}`}>
            🌐 Remote
          </button>
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${category === c ? "bg-purple-600 text-white" : "bg-theme-secondary text-theme-muted hover:bg-theme-hover"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-theme-muted">
            <FaBriefcase className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No jobs found</p>
          </div>
        ) : filtered.map(job => (
          <div key={job.id} className="bg-theme-card rounded-2xl p-4 border border-theme hover:border-purple-500/50 transition-all">
            <div className="flex items-start gap-3">
              <img src={job.logo} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-theme-primary text-sm">{job.title}</p>
                    <p className="text-xs text-theme-muted flex items-center gap-1 mt-0.5">
                      <HiOfficeBuilding size={11} /> {job.company}
                    </p>
                  </div>
                  <button onClick={() => setSaved(p => { const s = new Set(p); s.has(job.id) ? s.delete(job.id) : s.add(job.id); return s; })}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition ${saved.has(job.id) ? "text-purple-500" : "text-theme-muted hover:text-purple-400"}`}>
                    <FaBookmark size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-theme-muted">
                  <span className="flex items-center gap-1"><FaMapMarkerAlt size={9} />{job.location}</span>
                  <span className="flex items-center gap-1"><HiClock size={10} />{job.type}</span>
                  {job.remote && <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Remote</span>}
                </div>
                <p className="text-xs text-green-500 font-semibold mt-1">{job.salary}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.skills.map(s => (
                    <span key={s} className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-theme-muted">{job.applicants} applicants · {job.posted}</span>
                  <button onClick={() => setApplied(p => new Set([...p, job.id]))}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${applied.has(job.id) ? "bg-green-500/20 text-green-400" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                    {applied.has(job.id) ? "✓ Applied" : "Apply Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
