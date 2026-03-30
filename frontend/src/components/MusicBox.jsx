import React, { useState, useRef, useEffect } from "react";
import { HiX, HiPlay, HiPause, HiSearch } from "react-icons/hi";
import { FaMusic } from "react-icons/fa";

const MUSIC_LIST = [
  { title: "Summer Vibes", artist: "Bensound", genre: "Pop", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3", cover: "🌞" },
  { title: "Chill Lo-fi", artist: "Pixabay", genre: "Chill", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3", cover: "🍃" },
  { title: "Happy Pop", artist: "Pixabay", genre: "Pop", url: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_5bfb8a4f3e.mp3", cover: "😊" },
  { title: "Cinematic", artist: "Pixabay", genre: "Cinematic", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d577.mp3", cover: "🎬" },
  { title: "Dance Beat", artist: "Pixabay", genre: "Dance", url: "https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3", cover: "💃" },
  { title: "Acoustic", artist: "Pixabay", genre: "Chill", url: "https://cdn.pixabay.com/download/audio/2022/04/27/audio_67f8b9a1c8.mp3", cover: "🎸" },
  { title: "Upbeat", artist: "Pixabay", genre: "Upbeat", url: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3", cover: "⚡" },
  { title: "Romantic", artist: "Pixabay", genre: "Romantic", url: "https://cdn.pixabay.com/download/audio/2022/01/20/audio_6efa9a4a3e.mp3", cover: "❤️" },
  { title: "Electronic", artist: "Pixabay", genre: "Electronic", url: "https://cdn.pixabay.com/download/audio/2022/06/07/audio_b9e5b7b1c4.mp3", cover: "🎧" },
  { title: "Motivational", artist: "Pixabay", genre: "Cinematic", url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_1a7e8b9c3d.mp3", cover: "✨" },
];

const GENRES = ["All", "Pop", "Chill", "Lo-fi", "Cinematic", "Dance", "Electronic", "Romantic", "Happy", "Upbeat", "Fun"];

export default function MusicBox({ onClose, onSelect }) {
  const audioRef = useRef(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlay = async (index, url) => {
    if (!audioRef.current) return;
    if (playingIndex === index) {
      audioRef.current.pause();
      setPlayingIndex(null);
      return;
    }
    try {
      audioRef.current.pause();
      setLoading(true);
      audioRef.current.src = url;
      audioRef.current.load();
      await audioRef.current.play();
      setPlayingIndex(index);
    } catch (err) {
      console.error("Playback failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (music) => {
    if (audioRef.current) audioRef.current.pause();
    setPlayingIndex(null);
    onSelect(music);
  };

  const filtered = MUSIC_LIST.filter(m => {
    const matchGenre = genre === "All" || m.genre === genre;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.genre.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end z-50" onClick={onClose}>
      <div className="w-full bg-zinc-900 rounded-t-3xl max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FaMusic className="text-purple-400" />
            <h2 className="text-white text-lg font-bold">Music</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <HiX size={22} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
            <HiSearch className="text-white/40" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search songs..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40" />
          </div>
        </div>

        {/* Genre filter */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide flex-shrink-0">
          {GENRES.map(g => (
            <button key={g} onClick={() => setGenre(g)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${genre === g ? "bg-purple-600 text-white" : "bg-zinc-800 text-white/60 hover:bg-zinc-700"}`}>
              {g}
            </button>
          ))}
        </div>

        {/* Music list */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-1">
          {filtered.map((music, index) => {
            const isPlaying = playingIndex === MUSIC_LIST.indexOf(music);
            return (
              <div key={index}
                className={`flex items-center gap-3 p-3 rounded-xl transition ${isPlaying ? "bg-purple-600/20 border border-purple-500/40" : "hover:bg-zinc-800"}`}>
                <div className="w-11 h-11 rounded-xl bg-zinc-700 flex items-center justify-center text-2xl flex-shrink-0">
                  {music.cover}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isPlaying ? "text-purple-300" : "text-white"}`}>{music.title}</p>
                  <p className="text-xs text-white/40 truncate">{music.genre}</p>
                </div>
                <button onClick={() => togglePlay(MUSIC_LIST.indexOf(music), music.url)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition ${isPlaying ? "bg-purple-600 text-white" : "bg-zinc-700 text-white/70 hover:bg-zinc-600"}`}>
                  {isPlaying ? <HiPause size={16} /> : <HiPlay size={16} />}
                </button>
                <button onClick={() => handleSelect(music)}
                  className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-purple-400 hover:text-white transition flex-shrink-0">
                  Use
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-white/40 py-8 text-sm">No songs found</p>
          )}
        </div>

        <audio ref={audioRef} preload="none" onEnded={() => setPlayingIndex(null)} />
      </div>
    </div>
  );
}
