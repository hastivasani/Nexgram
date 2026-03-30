import { useState, useEffect } from "react";
import { FaNewspaper, FaExternalLinkAlt } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { getNews } from "../services/api";

const CATEGORIES = ["All", "Technology", "Sports", "Finance", "World", "Entertainment", "Health"];

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState("All");
  const [lastFetch, setLastFetch] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNews();
      setArticles(res.data.articles || []);
      setLastFetch(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const filtered = category === "All" ? articles : articles.filter(a => a.category === category);

  return (
    <div className="min-h-screen bg-theme-primary pb-20 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-theme-primary/90 backdrop-blur border-b border-theme px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaNewspaper className="text-purple-500 text-xl" />
          <h1 className="text-lg font-bold text-theme-primary">News</h1>
          {lastFetch && <span className="text-xs text-theme-muted">{timeAgo(lastFetch)}</span>}
        </div>
        <button onClick={load} disabled={loading}
          className="p-2 rounded-full hover:bg-theme-hover transition text-theme-muted disabled:opacity-50">
          <HiRefresh size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              category === c ? "bg-purple-600 text-white" : "bg-theme-secondary text-theme-muted hover:bg-theme-hover"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* News list */}
      <div className="px-4 space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-24 h-24 rounded-xl bg-theme-secondary flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-theme-secondary rounded w-3/4" />
                <div className="h-3 bg-theme-secondary rounded w-full" />
                <div className="h-3 bg-theme-secondary rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-theme-muted">
            <FaNewspaper className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No news available</p>
          </div>
        ) : (
          <>
            {/* Featured - first article big */}
            {filtered[0] && (
              <a href={filtered[0].url !== "#" ? filtered[0].url : undefined}
                target="_blank" rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden border border-theme hover:border-purple-500/50 transition-all group">
                {filtered[0].image ? (
                  <img src={filtered[0].image} alt={filtered[0].title}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center text-5xl">📰</div>
                )}
                <div className="p-4 bg-theme-card">
                  <div className="flex items-center gap-2 mb-2">
                    {filtered[0].category && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-semibold uppercase">{filtered[0].category}</span>
                    )}
                    <span className="text-xs text-theme-muted ml-auto">{timeAgo(filtered[0].publishedAt)}</span>
                  </div>
                  <h2 className="font-bold text-theme-primary text-base line-clamp-2 group-hover:text-purple-400 transition-colors">{filtered[0].title}</h2>
                  {filtered[0].description && <p className="text-sm text-theme-muted mt-1 line-clamp-2">{filtered[0].description}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-theme-muted">{filtered[0].source}</span>
                    {filtered[0].url !== "#" && <span className="text-xs text-purple-400 flex items-center gap-1">Read <FaExternalLinkAlt size={9} /></span>}
                  </div>
                </div>
              </a>
            )}

            {/* Rest as list */}
            {filtered.slice(1).map((article, i) => (
              <a key={i} href={article.url !== "#" ? article.url : undefined}
                target="_blank" rel="noopener noreferrer"
                className="flex gap-3 p-3 rounded-2xl border border-theme hover:border-purple-500/50 bg-theme-card transition-all group">
                {article.image ? (
                  <img src={article.image} alt={article.title}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-theme-secondary flex items-center justify-center text-2xl flex-shrink-0">📰</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {article.category && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-semibold uppercase">{article.category}</span>
                    )}
                    <span className="text-[10px] text-theme-muted ml-auto">{timeAgo(article.publishedAt)}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-theme-primary line-clamp-2 group-hover:text-purple-400 transition-colors">{article.title}</h3>
                  <p className="text-xs text-theme-muted mt-1">{article.source}</p>
                </div>
              </a>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
