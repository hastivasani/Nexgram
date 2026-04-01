import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaStar, FaTicketAlt, FaSearch, FaHeart, FaRegHeart, FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";
import { HiX } from "react-icons/hi";

const CATEGORIES = ["All", "Music", "Comedy", "Tech", "Sports", "Food", "Art", "Workshop"];

const EVENTS = [
  { id:1, title:"Arijit Singh Live Concert", cat:"Music", date:"Sat, Apr 5", time:"7:00 PM", venue:"DY Patil Stadium, Mumbai", price:1499, originalPrice:2499, img:"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=250&fit=crop", tag:"🔥 Selling Fast", seats:234 },
  { id:2, title:"Zakir Khan Stand-Up", cat:"Comedy", date:"Sun, Apr 6", time:"8:00 PM", venue:"NCPA, Mumbai", price:799, originalPrice:999, img:"https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=250&fit=crop", tag:"⭐ Top Pick", seats:89 },
  { id:3, title:"React India Conference", cat:"Tech", date:"Fri, Apr 11", time:"9:00 AM", venue:"Bangalore International Centre", price:2999, originalPrice:3999, img:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop", tag:"🎤 Conference", seats:412 },
  { id:4, title:"Sunburn Festival 2026", cat:"Music", date:"Sat, Apr 12", time:"4:00 PM", venue:"Vagator Beach, Goa", price:3499, originalPrice:4999, img:"https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=250&fit=crop", tag:"🎵 Festival", seats:1200 },
  { id:5, title:"Food & Wine Festival", cat:"Food", date:"Sun, Apr 13", time:"12:00 PM", venue:"Bandra Kurla Complex", price:599, originalPrice:799, img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop", tag:"🍷 Gourmet", seats:320 },
  { id:6, title:"Photography Workshop", cat:"Workshop", date:"Sat, Apr 19", time:"10:00 AM", venue:"Colaba, Mumbai", price:1299, originalPrice:1799, img:"https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=250&fit=crop", tag:"📸 Workshop", seats:30 },
];

export default function EventsBooking() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [wishlist, setWishlist] = useState(new Set());
  const [booked, setBooked] = useState(null);
  const [qty, setQty] = useState(1);
  const [showModal, setShowModal] = useState(null);

  const filtered = EVENTS.filter(e =>
    (cat === "All" || e.cat === cat) &&
    (!search || e.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-[68px] md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">🎪 Events</h1>
          <p className="text-white/80 text-xs">Concerts, shows & experiences</p>
        </div>
      </div>

      {booked && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-semibold animate-bounce">
          🎉 {qty} ticket{qty > 1 ? "s" : ""} booked for {booked}!
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-xl px-3 py-2.5">
          <FaSearch className="text-theme-muted" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
            className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-muted" />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${cat === c ? "bg-violet-600 text-white" : "bg-theme-card border border-theme text-theme-muted"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(ev => (
            <div key={ev.id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all">
              <div className="relative">
                <img src={ev.img} alt={ev.title} className="w-full h-44 object-cover" />
                <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full font-semibold">{ev.tag}</span>
                <button onClick={() => setWishlist(p => { const s = new Set(p); s.has(ev.id) ? s.delete(ev.id) : s.add(ev.id); return s; })}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                  {wishlist.has(ev.id) ? <FaHeart size={14} className="text-red-400" /> : <FaRegHeart size={14} className="text-white" />}
                </button>
              </div>
              <div className="p-4">
                <p className="font-bold text-theme-primary text-[15px]">{ev.title}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-theme-muted">
                  <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {ev.date}</span>
                  <span className="flex items-center gap-1"><FaClock size={10} /> {ev.time}</span>
                  <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {ev.venue}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="font-bold text-violet-400 text-lg">₹{ev.price}</span>
                    <span className="text-xs text-theme-muted line-through ml-2">₹{ev.originalPrice}</span>
                    <p className="text-[10px] text-theme-muted">{ev.seats} seats left</p>
                  </div>
                  <button onClick={() => setShowModal(ev)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold">
                    <FaTicketAlt size={12} /> Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center">
          <div className="w-full max-w-md bg-theme-card rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-theme-primary">{showModal.title}</p>
              <button onClick={() => setShowModal(null)}><HiX size={20} className="text-theme-muted" /></button>
            </div>
            <p className="text-sm text-theme-muted mb-4">{showModal.date} · {showModal.time}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-theme-primary">Tickets</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full bg-theme-input border border-theme text-theme-primary font-bold">−</button>
                <span className="font-bold text-theme-primary w-6 text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))} className="w-8 h-8 rounded-full bg-theme-input border border-theme text-theme-primary font-bold">+</button>
              </div>
            </div>
            <div className="bg-theme-input rounded-xl p-3 mb-4 text-sm">
              <div className="flex justify-between text-theme-muted"><span>{qty} × ₹{showModal.price}</span><span>₹{qty * showModal.price}</span></div>
              <div className="flex justify-between text-theme-muted mt-1"><span>Convenience fee</span><span>₹{qty * 49}</span></div>
              <div className="flex justify-between font-bold text-theme-primary border-t border-theme mt-2 pt-2">
                <span>Total</span><span className="text-violet-400">₹{qty * showModal.price + qty * 49}</span>
              </div>
            </div>
            <button onClick={() => { setBooked(showModal.title); setShowModal(null); setTimeout(() => setBooked(null), 3000); }}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl text-[15px]">
              Pay ₹{qty * showModal.price + qty * 49}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
