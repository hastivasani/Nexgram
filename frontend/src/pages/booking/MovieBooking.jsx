import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaStar, FaFire, FaTicketAlt, FaSearch, FaHeart, FaRegHeart, FaPlay } from "react-icons/fa";
import { HiLocationMarker, HiClock, HiCalendar, HiX } from "react-icons/hi";

const MOVIES = [
  {
    id: 1, title: "Kalki 2898 AD", lang: "Hindi", genre: "Sci-Fi · Action", rating: 8.4,
    votes: "142K", duration: "3h 1m", cert: "UA",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop",
    banner: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&h=400&fit=crop",
    tag: "🔥 Trending", price: 250,
  },
  {
    id: 2, title: "Stree 2", lang: "Hindi", genre: "Horror · Comedy", rating: 8.9,
    votes: "198K", duration: "2h 22m", cert: "UA",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop",
    tag: "⭐ Top Rated", price: 220,
  },
  {
    id: 3, title: "Pushpa 2", lang: "Telugu · Hindi", genre: "Action · Drama", rating: 8.6,
    votes: "231K", duration: "3h 20m", cert: "A",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop",
    tag: "🎬 Blockbuster", price: 280,
  },
  {
    id: 4, title: "Fighter", lang: "Hindi", genre: "Action · Thriller", rating: 7.2,
    votes: "89K", duration: "2h 46m", cert: "UA",
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop",
    banner: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=400&fit=crop",
    tag: "🆕 New", price: 200,
  },
  {
    id: 5, title: "Animal", lang: "Hindi", genre: "Action · Crime", rating: 7.8,
    votes: "176K", duration: "3h 21m", cert: "A",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
    banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop",
    tag: "🔥 Trending", price: 230,
  },
  {
    id: 6, title: "Dunki", lang: "Hindi", genre: "Drama · Comedy", rating: 7.0,
    votes: "67K", duration: "2h 41m", cert: "UA",
    poster: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=300&h=450&fit=crop",
    banner: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&h=400&fit=crop",
    tag: "🎭 Drama", price: 190,
  },
];

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];
const DATES = ["Today", "Tomorrow", "Wed 2", "Thu 3", "Fri 4", "Sat 5", "Sun 6"];
const FORMATS = ["All", "2D", "3D", "IMAX", "4DX"];

const CINEMAS = [
  { name: "PVR Cinemas", location: "Andheri West", distance: "2.1 km", screens: ["10:30 AM", "1:45 PM", "5:00 PM", "8:15 PM", "11:30 PM"], format: "2D · 3D · IMAX" },
  { name: "INOX Megaplex", location: "Malad", distance: "4.3 km", screens: ["11:00 AM", "2:30 PM", "6:00 PM", "9:30 PM"], format: "2D · 3D" },
  { name: "Cinepolis", location: "Versova", distance: "5.8 km", screens: ["12:00 PM", "3:15 PM", "7:00 PM", "10:00 PM"], format: "2D · 4DX" },
  { name: "Carnival Cinemas", location: "Goregaon", distance: "6.2 km", screens: ["10:00 AM", "1:00 PM", "4:30 PM", "8:00 PM"], format: "2D" },
];

// Seat layout
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 10;

function SeatPicker({ movie, showtime, cinema, onClose, onConfirm }) {
  const [selected, setSelected] = useState(new Set());
  const [booked] = useState(new Set([2, 5, 8, 12, 15, 23, 31, 44, 55, 67]));

  const toggle = (idx) => {
    if (booked.has(idx)) return;
    setSelected(prev => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  };

  const total = selected.size * movie.price;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center">
      <div className="w-full max-w-lg bg-theme-card rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-theme sticky top-0 bg-theme-card z-10">
          <div>
            <p className="font-bold text-theme-primary">{movie.title}</p>
            <p className="text-xs text-theme-muted">{cinema} · {showtime}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-theme-hover text-theme-muted transition">
            <HiX size={20} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Screen */}
          <div className="mb-6">
            <div className="w-full h-2 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full mb-1" />
            <p className="text-center text-xs text-theme-muted">SCREEN</p>
          </div>

          {/* Seats */}
          <div className="space-y-2 mb-6">
            {ROWS.map((row, ri) => (
              <div key={row} className="flex items-center gap-1.5">
                <span className="text-xs text-theme-muted w-4 text-center">{row}</span>
                <div className="flex gap-1 flex-1 justify-center">
                  {Array.from({ length: COLS }, (_, ci) => {
                    const idx = ri * COLS + ci;
                    const isBooked = booked.has(idx);
                    const isSel = selected.has(idx);
                    return (
                      <button key={ci} onClick={() => toggle(idx)}
                        className={`w-7 h-6 rounded-t-lg text-[9px] font-bold transition ${
                          isBooked ? "bg-gray-600 cursor-not-allowed text-gray-500" :
                          isSel ? "bg-purple-500 text-white" :
                          "bg-theme-input hover:bg-purple-500/30 text-theme-muted border border-theme"
                        }`}>
                        {ci + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-5 text-xs text-theme-muted">
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded-t bg-theme-input border border-theme" /> Available</div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded-t bg-purple-500" /> Selected</div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded-t bg-gray-600" /> Booked</div>
          </div>

          {/* Summary */}
          {selected.size > 0 && (
            <div className="bg-theme-input rounded-2xl p-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-theme-muted">{selected.size} seat{selected.size > 1 ? "s" : ""} × ₹{movie.price}</span>
                <span className="font-bold text-theme-primary">₹{total}</span>
              </div>
              <div className="flex justify-between text-xs text-theme-muted">
                <span>Convenience fee</span>
                <span>₹{Math.round(total * 0.05)}</span>
              </div>
              <div className="border-t border-theme mt-2 pt-2 flex justify-between font-bold">
                <span className="text-theme-primary">Total</span>
                <span className="text-purple-400">₹{total + Math.round(total * 0.05)}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => selected.size > 0 && onConfirm(selected.size, total)}
            disabled={selected.size === 0}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl disabled:opacity-40 transition text-[15px]">
            {selected.size === 0 ? "Select seats" : `Pay ₹${total + Math.round(total * 0.05)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MovieBooking() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [wishlist, setWishlist] = useState(new Set());
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [showSeats, setShowSeats] = useState(false);
  const [booked, setBooked] = useState(false);

  const filtered = MOVIES.filter(m =>
    !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.genre.toLowerCase().includes(search.toLowerCase())
  );

  const handleShowtime = (movie, cinema, time) => {
    setSelectedMovie(movie);
    setSelectedCinema(cinema);
    setSelectedShowtime(time);
    setShowSeats(true);
  };

  const handleConfirm = (seats, total) => {
    setShowSeats(false);
    setBooked(true);
    setTimeout(() => setBooked(false), 4000);
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-red-600 to-pink-600 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white">
          <FaArrowLeft />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            🎬 Movie Tickets
          </h1>
          <p className="text-white/80 text-xs">Book cinema tickets instantly</p>
        </div>
        <button className="flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-2 rounded-xl">
          <HiLocationMarker size={14} /> {city}
        </button>
      </div>

      {/* Success toast */}
      {booked && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-semibold flex items-center gap-2 animate-bounce">
          🎉 Booking Confirmed!
        </div>
      )}

      <div className="px-4 pt-4 space-y-5">

        {/* Search + City */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-theme-card border border-theme rounded-xl px-3 py-2.5">
            <FaSearch className="text-theme-muted flex-shrink-0" size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-muted" />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)}
            className="bg-theme-card border border-theme rounded-xl px-3 py-2.5 text-sm text-theme-primary outline-none">
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Date strip */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {DATES.map(d => (
            <button key={d} onClick={() => setSelectedDate(d)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                selectedDate === d ? "bg-red-500 text-white" : "bg-theme-card border border-theme text-theme-muted hover:border-red-500/50"
              }`}>
              {d}
            </button>
          ))}
        </div>

        {/* Format filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FORMATS.map(f => (
            <button key={f} onClick={() => setSelectedFormat(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedFormat === f ? "bg-pink-500 text-white" : "bg-theme-card border border-theme text-theme-muted"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Now Showing */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FaFire className="text-red-500" />
            <h2 className="font-bold text-lg">Now Showing</h2>
            <span className="text-xs text-theme-muted ml-auto">{filtered.length} movies</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map(movie => (
              <div key={movie.id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden hover:border-red-500/40 transition-all group cursor-pointer"
                onClick={() => setSelectedMovie(selectedMovie?.id === movie.id ? null : movie)}>
                <div className="relative">
                  <img src={movie.poster} alt={movie.title} className="w-full h-52 object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-semibold">{movie.tag}</span>
                  <span className="absolute top-2 right-2 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">{movie.cert}</span>
                  <button onClick={e => { e.stopPropagation(); setWishlist(p => { const s = new Set(p); s.has(movie.id) ? s.delete(movie.id) : s.add(movie.id); return s; }); }}
                    className="absolute bottom-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center">
                    {wishlist.has(movie.id) ? <FaHeart size={12} className="text-red-400" /> : <FaRegHeart size={12} className="text-white" />}
                  </button>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <FaStar size={10} className="text-yellow-400" />
                    <span className="text-white text-[11px] font-bold">{movie.rating}</span>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="font-bold text-[13px] text-theme-primary leading-tight line-clamp-1">{movie.title}</p>
                  <p className="text-[10px] text-theme-muted mt-0.5">{movie.genre}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-theme-muted">
                    <span className="flex items-center gap-0.5"><HiClock size={9} /> {movie.duration}</span>
                    <span className="text-red-400 font-semibold ml-auto">₹{movie.price}+</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelectedMovie(movie); }}
                    className="mt-2 w-full py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1">
                    <FaTicketAlt size={10} /> Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cinema listing for selected movie */}
        {selectedMovie && (
          <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-theme">
              <img src={selectedMovie.poster} className="w-12 h-16 rounded-lg object-cover" alt="" />
              <div>
                <p className="font-bold text-theme-primary">{selectedMovie.title}</p>
                <p className="text-xs text-theme-muted">{selectedMovie.lang} · {selectedMovie.cert} · {selectedMovie.duration}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <FaStar size={10} className="text-yellow-400" />
                  <span className="text-xs font-semibold text-theme-primary">{selectedMovie.rating}</span>
                  <span className="text-xs text-theme-muted">({selectedMovie.votes} votes)</span>
                </div>
              </div>
              <button onClick={() => setSelectedMovie(null)} className="ml-auto text-theme-muted hover:text-theme-primary p-1">
                <HiX size={18} />
              </button>
            </div>

            <div className="divide-y divide-theme">
              {CINEMAS.map((cinema, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-theme-primary text-sm">{cinema.name}</p>
                      <p className="text-xs text-theme-muted flex items-center gap-1 mt-0.5">
                        <HiLocationMarker size={10} /> {cinema.location} · {cinema.distance}
                      </p>
                      <p className="text-[10px] text-green-400 mt-0.5">{cinema.format}</p>
                    </div>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">Available</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cinema.screens.map(time => (
                      <button key={time} onClick={() => handleShowtime(selectedMovie, cinema.name, time)}
                        className="px-3 py-1.5 border border-green-500/50 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/10 transition">
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seat Picker Modal */}
      {showSeats && selectedMovie && (
        <SeatPicker
          movie={selectedMovie}
          showtime={selectedShowtime}
          cinema={selectedCinema}
          onClose={() => setShowSeats(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
