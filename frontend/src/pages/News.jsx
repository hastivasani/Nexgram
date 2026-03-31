import { useState, useEffect } from "react";
import { FaNewspaper, FaExternalLinkAlt, FaFire, FaGlobe, FaFootballBall, FaMicrochip, FaHeartbeat, FaFilm, FaChartLine } from "react-icons/fa";
import { HiRefresh, HiClock, HiBookmark, HiOutlineBookmark } from "react-icons/hi";
import { getNews } from "../services/api";
import AOS from "aos";

const CATEGORIES = [
  { id: "All",           label: "All",           icon: FaFire },
  { id: "Technology",    label: "Tech",          icon: FaMicrochip },
  { id: "World",         label: "World",         icon: FaGlobe },
  { id: "Sports",        label: "Sports",        icon: FaFootballBall },
  { id: "Finance",       label: "Finance",       icon: FaChartLine },
  { id: "Health",        label: "Health",        icon: FaHeartbeat },
  { id: "Entertainment", label: "Entertainment", icon: FaFilm },
];

const CATEGORY_COLORS = {
  Technology:    "bg-blue-500/20 text-blue-400 border-blue-500/30",
  World:         "bg-green-500/20 text-green-400 border-green-500/30",
  Sports:        "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Finance:       "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Health:        "bg-red-500/20 text-red-400 border-red-500/30",
  Entertainment: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function News() {
  const [articles,   setArticles]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [category,   setCategory]   = useState("All");
  const [saved,      setSaved]      = useState(new Set());
  const [lastFetch,  setLastFetch]  = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNews();
      setArticles(res.data.articles || []);
      setLastFetch(new Date());
      setTimeout(() => AOS.refresh(), 100);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const toggleSave = (e, url) => {
    e.preventDefault(); e.stopPropagation();
    setSaved(prev => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  };

  const filtered = category === "All" ? articles : articles.filter(a => a.category === category);

  return (
    <div className="min-h-screen bg-theme-primary pb-20 md:pb-6">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-theme-primary/95 backdrop-blur-md border-b border-theme px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
              <FaNewspaper className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-base font-bold text-theme-primary leading-none">News</h1>
              {lastFetch && (
                <p className="text-[10px] text-theme-muted flex items-center gap-1 mt-0.5">
                  <HiClock size={9} /> Updated {timeAgo(lastFetch)}
                </p>
              )}
            </div>
          </div>
          <button onClick={load} disabled={loading}
            className="p-2 rounded-full hover:bg-theme-hover transition text-theme-muted disabled:opacity-50">
            <HiRefresh size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === id
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                  : "bg-theme-card border border-theme text-theme-muted hover:border-purple-500/50 hover:text-theme-primary"
              }`}>
              <Icon size={10} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-4">
            {/* Featured skeleton */}
            <div className="animate-pulse rounded-2xl overflow-hidden border border-theme">
              <div className="w-full h-52 bg-theme-secondary" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-theme-secondary rounded w-1/4" />
                <div className="h-5 bg-theme-secondary rounded w-full" />
                <div className="h-4 bg-theme-secondary rounded w-3/4" />
              </div>
            </div>
            {/* List skeletons */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse p-3 rounded-2xl border border-theme">
                <div className="w-20 h-20 rounded-xl bg-theme-secondary flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-theme-secondary rounded w-1/4" />
                  <div className="h-4 bg-theme-secondary rounded w-full" />
                  <div className="h-3 bg-theme-secondary rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-theme-muted">
            <FaNewspaper className="text-5xl mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No news available</p>
            <p className="text-sm mt-1">Try a different category</p>
          </div>
        ) : (
          <>
            {/* ── Featured Article ── */}
            {filtered[0] && (
              <a href={filtered[0].url !== "#" ? filtered[0].url : undefined}
                target="_blank" rel="noopener noreferrer"
                data-aos="fade-up" data-aos-duration="500"
                className="block rounded-2xl overflow-hidden border border-theme hover:border-purple-500/40 transition-all group shadow-sm">
                <div className="relative">
                  {filtered[0].image ? (
                    <img src={filtered[0].image} alt={filtered[0].title}
                      className="w-full h-52 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      onError={e => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-purple-900/60 to-pink-900/60 flex items-center justify-center">
                      <FaNewspaper className="text-white/30 text-6xl" />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Category badge on image */}
                  {filtered[0].category && (
                    <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${CATEGORY_COLORS[filtered[0].category] || "bg-purple-500/20 text-purple-400 border-purple-500/30"}`}>
                      {filtered[0].category}
                    </span>
                  )}
                  {/* Bookmark */}
                  <button onClick={e => toggleSave(e, filtered[0].url)}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition">
                    {saved.has(filtered[0].url) ? <HiBookmark size={15} className="text-yellow-400" /> : <HiOutlineBookmark size={15} />}
                  </button>
                </div>
                <div className="p-4 bg-theme-card">
                  <h2 className="font-bold text-theme-primary text-[17px] leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors mb-2">
                    {filtered[0].title}
                  </h2>
                  {filtered[0].description && (
                    <p className="text-sm text-theme-muted line-clamp-2 mb-3">{filtered[0].description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <FaGlobe size={9} className="text-purple-400" />
                      </div>
                      <span className="text-xs font-medium text-theme-muted">{filtered[0].source}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-theme-muted">
                      <HiClock size={11} />
                      {timeAgo(filtered[0].publishedAt)}
                    </div>
                  </div>
                </div>
              </a>
            )}

            {/* ── 2-column grid for articles 2-3 ── */}
            {filtered.length > 1 && (
              <div className="grid grid-cols-2 gap-3" data-aos="fade-up" data-aos-delay="100">
                {filtered.slice(1, 3).map((article, i) => (
                  <a key={i} href={article.url !== "#" ? article.url : undefined}
                    target="_blank" rel="noopener noreferrer"
                    className="rounded-2xl overflow-hidden border border-theme hover:border-purple-500/40 transition-all group bg-theme-card">
                    <div className="relative">
                      {article.image ? (
                        <img src={article.image} alt={article.title}
                          className="w-full h-28 object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          onError={e => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-28 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center text-3xl">📰</div>
                      )}
                      <button onClick={e => toggleSave(e, article.url)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white">
                        {saved.has(article.url) ? <HiBookmark size={11} className="text-yellow-400" /> : <HiOutlineBookmark size={11} />}
                      </button>
                    </div>
                    <div className="p-2.5">
                      {article.category && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${CATEGORY_COLORS[article.category] || "bg-purple-500/20 text-purple-400 border-purple-500/30"}`}>
                          {article.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-[13px] text-theme-primary line-clamp-2 mt-1 group-hover:text-purple-400 transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-[10px] text-theme-muted mt-1.5 flex items-center gap-1">
                        <HiClock size={9} /> {timeAgo(article.publishedAt)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* ── Horizontal scroll "Breaking" strip ── */}
            {filtered.length > 3 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LATEST
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                  {filtered.slice(3, 8).map((article, i) => (
                    <a key={i} href={article.url !== "#" ? article.url : undefined}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-theme hover:border-purple-500/40 transition-all group bg-theme-card">
                      {article.image ? (
                        <img src={article.image} alt={article.title}
                          className="w-full h-24 object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          onError={e => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-24 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center text-2xl">📰</div>
                      )}
                      <div className="p-2.5">
                        <h3 className="font-semibold text-[12px] text-theme-primary line-clamp-2 group-hover:text-purple-400 transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-[10px] text-theme-muted mt-1">{article.source}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Rest as clean list ── */}
            {filtered.length > 8 && (
              <div>
                <p className="text-xs font-bold text-theme-muted uppercase tracking-wide mb-3">More Stories</p>
                <div className="space-y-3">
                  {filtered.slice(8).map((article, i) => (
                    <a key={i} href={article.url !== "#" ? article.url : undefined}
                      target="_blank" rel="noopener noreferrer"
                      data-aos="fade-up" data-aos-delay={Math.min(i * 50, 300)}
                      className="flex gap-3 p-3 rounded-2xl border border-theme hover:border-purple-500/40 bg-theme-card transition-all group">
                      {article.image ? (
                        <img src={article.image} alt={article.title}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0 group-hover:scale-[1.03] transition-transform"
                          onError={e => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-theme-secondary flex items-center justify-center text-2xl flex-shrink-0">📰</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-semibold text-sm text-theme-primary line-clamp-2 group-hover:text-purple-400 transition-colors leading-snug flex-1">
                            {article.title}
                          </h3>
                          <button onClick={e => toggleSave(e, article.url)} className="flex-shrink-0 ml-1 mt-0.5">
                            {saved.has(article.url)
                              ? <HiBookmark size={14} className="text-yellow-400" />
                              : <HiOutlineBookmark size={14} className="text-theme-muted hover:text-yellow-400 transition" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          {article.category && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${CATEGORY_COLORS[article.category] || "bg-purple-500/20 text-purple-400 border-purple-500/30"}`}>
                              {article.category}
                            </span>
                          )}
                          <span className="text-[10px] text-theme-muted">{article.source}</span>
                          <span className="text-[10px] text-theme-muted ml-auto flex items-center gap-0.5">
                            <HiClock size={9} /> {timeAgo(article.publishedAt)}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
