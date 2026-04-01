import { useState } from "react";
import { HiHeart, HiChat, HiBookmark, HiViewGrid } from "react-icons/hi";
import PostModal from "./child/PostModal";
import { getSavedPosts } from "../services/api";

export default function GalleryProfile({ posts = [], loading = false }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [tab, setTab] = useState("posts"); // posts | saved
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedLoaded, setSavedLoaded] = useState(false);

  const handleSavedTab = async () => {
    setTab("saved");
    if (!savedLoaded) {
      setLoadingSaved(true);
      try {
        const res = await getSavedPosts();
        setSavedPosts(res.data || []);
        setSavedLoaded(true);
      } catch (_) {}
      finally { setLoadingSaved(false); }
    }
  };

  const displayPosts = tab === "saved" ? savedPosts : posts;
  const isLoading = tab === "saved" ? loadingSaved : loading;

  return (
    <div className="bg-theme-primary">
      {/* Tabs */}
      <div className="flex border-t border-theme">
        <button
          onClick={() => setTab("posts")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold border-t-2 transition ${
            tab === "posts" ? "border-theme-primary text-theme-primary" : "border-transparent text-theme-muted"
          }`}
        >
          <HiViewGrid size={16} /> Posts
        </button>
        <button
          onClick={handleSavedTab}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold border-t-2 transition ${
            tab === "saved" ? "border-theme-primary text-theme-primary" : "border-transparent text-theme-muted"
          }`}
        >
          <HiBookmark size={16} /> Saved
        </button>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-theme-muted">Loading...</div>
      ) : displayPosts.length === 0 ? (
        <div className="p-6 text-center text-theme-muted">
          {tab === "saved" ? "No saved posts yet." : "No posts yet."}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {displayPosts.map((post) => (
            <div
              key={post._id}
              onClick={() => setSelectedPost(post)}
              className="relative group cursor-pointer aspect-square overflow-hidden bg-theme-secondary"
            >
              {post.mediaType === "video" ? (
                <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt={post.caption || "post"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold">
                <div className="flex items-center gap-1.5">
                  <HiHeart size={20} />
                  <span className="text-sm">{post.likes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiChat size={20} />
                  <span className="text-sm">{post.comments?.length || 0}</span>
                </div>
              </div>
              {post.mediaType === "video" && (
                <span className="absolute top-2 right-2 text-white text-xs bg-black/50 rounded px-1.5 py-0.5">▶</span>
              )}
            </div>
          ))}
        </div>
      )}

      <PostModal
        selectedPost={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
