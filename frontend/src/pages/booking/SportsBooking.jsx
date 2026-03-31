import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaFutbol, FaCricketBall } from "react-icons/fa";
import { HiX } from "react-icons/hi";

const SPORTS = ["All", "Cricket", "Football", "Badminton", "Tennis", "Swimming", "Gym", "Yoga"];

const VENUES = [
  { id:1, name:"Wankhede Stadium", sport:"Cricket", location:"Marine Lines, Mumbai", rating:4.8, price:500, per:"per session", img:"https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop", slots:["6:00 AM","8:00 AM","4:00 PM","6:00 PM"], tag:"🏏 Premium" },
  { id:2, name:"Cooperage Football Ground", sport:"Football", location:"Colaba, Mumbai", rating:4.5, price:300, per:"per hour", img:"https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop", slots:["7:00 AM","5:00 PM","7:00 PM"], tag:"⚽ Popular" },
  { id:3, name:"Khar Gymkhana", sport:"Badminton", location:"Khar, Mumbai", rating:4.6, price:200, per:"per hour", img:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=250&fit=crop", slots:["6:00 AM","7:00 AM","8:00 AM","5:00 PM","6:00 PM","7:00 PM"], tag:"🏸 Courts" },
  { id:4, name:"YMCA Swimming Pool", sport:"Swimming", location:"Colaba, Mumbai", rating:4.3, price:150, per:"per session", img:"https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400&h=250&fit=crop", slots:["6:00 AM","7:00 AM","8:00 AM","4:00 PM","5:00 PM"], tag:"🏊 Pool" },
  { id:5, name:"Gold's Gym", sport:"Gym", location:"Andheri, Mumbai", rating:4.7, price:800, per:"per month", img:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop", slots:["5:00 AM","6:00 AM","7:00 AM","8:00 AM","5:00 PM","6:00 PM","7:00 PM","8:00 PM"], tag:"💪 Gym" },
  { id:6, name:"Yoga Studio Mumbai", sport:"Yoga", location:"Bandra, Mumbai", rating:4.9, price:400, per:"per session", img:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop", slots:["6:00 AM","7:00 AM","8:00 AM","6:00 PM","7:00 PM"], tag:"🧘 Wellness" },
];

export default function SportsBooking() {
  const navigate = useNavigate();
  const [sport, setSport] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [booked, setBooked] = useState(false);

  const filtered = VENUES.filter(v =>
    (sport === "All" || v.sport === sport) &&
    (!search || v.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-green-600 to-teal-600 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">🏟️ Sports & Fitness</h1>
          <p className="text-white/80 text-xs">Book courts, pools & gyms</p>
        </div>
      </div>

      {booked && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-semibold animate-bounce">
          ✅ Slot booked successfully!
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-xl px-3 py-2.5">
          <FaSearch className="text-theme-muted" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search venues..."
            className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-muted" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {SPORTS.map(s => (
            <button key={s} onClick={() => setSport(s)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${sport === s ? "bg-green-600 text-white" : "bg-theme-card border border-theme text-theme-muted"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(v => (
            <div key={v.id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden hover:border-green-500/40 transition-all">
              <div className="relative">
                <img src={v.img} alt={v.name} className="w-full h-40 object-cover" />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">{v.tag}</span>
              </div>
              <div className="p-3">
                <p className="font-bold text-theme-primary text-sm">{v.name}</p>
                <p className="text-xs text-theme-muted flex items-center gap-1 mt-0.5"><FaMapMarkerAlt size={9} />{v.location}</p>
                <div className="flex items-center gap-1 mt-1">
                  <FaStar size={10} className="text-yellow-400" />
                  <span className="text-xs font-semibold text-theme-primary">{v.rating}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="font-bold text-green-400">₹{v.price}</span>
                    <span className="text-xs text-theme-muted ml-1">{v.per}</span>
                  </div>
                  <button onClick={() => { setShowModal(v); setSelectedSlot(""); }}
                    className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl text-xs font-bold">
                    Book Slot
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
              <p className="font-bold text-theme-primary">{showModal.name}</p>
              <button onClick={() => setShowModal(null)}><HiX size={20} className="text-theme-muted" /></button>
            </div>
            <p className="text-sm text-theme-muted mb-3">Select a time slot</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {showModal.slots.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${selectedSlot === slot ? "bg-green-600 text-white border-green-600" : "border-theme text-theme-muted hover:border-green-500"}`}>
                  {slot}
                </button>
              ))}
            </div>
            <div className="bg-theme-input rounded-xl p-3 mb-4 flex justify-between text-sm">
              <span className="text-theme-muted">Amount</span>
              <span className="font-bold text-green-400">₹{showModal.price}</span>
            </div>
            <button disabled={!selectedSlot}
              onClick={() => { setBooked(true); setShowModal(null); setTimeout(() => setBooked(false), 3000); }}
              className="w-full py-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-2xl disabled:opacity-40 text-[15px]">
              {selectedSlot ? `Confirm ${selectedSlot}` : "Select a slot"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
