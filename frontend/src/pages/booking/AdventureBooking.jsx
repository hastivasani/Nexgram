import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaMapMarkerAlt, FaStar, FaHeart, FaRegHeart, FaMountain, FaUsers, FaClock } from "react-icons/fa";
import { HiX, HiCheckCircle } from "react-icons/hi";

const CATEGORIES = ["All", "Trekking", "Skydiving", "Scuba Diving", "Bungee", "Paragliding", "Rafting", "Camping", "Cycling"];

const ADVENTURES = [
  { id:1, title:"Everest Base Camp Trek", cat:"Trekking", location:"Nepal", duration:"14 Days", difficulty:"Hard", price:45000, img:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=250&fit=crop", tag:"🏔️ Epic", rating:4.9, groupSize:"8-12", includes:["Guide","Accommodation","Meals","Permits"] },
  { id:2, title:"Skydiving over Aamby Valley", cat:"Skydiving", location:"Pune, Maharashtra", duration:"1 Day", difficulty:"Extreme", price:18000, img:"https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400&h=250&fit=crop", tag:"🪂 Thrilling", rating:4.8, groupSize:"1-4", includes:["Instructor","Equipment","Certificate","Photos"] },
  { id:3, title:"Scuba Diving in Andamans", cat:"Scuba Diving", location:"Andaman Islands", duration:"3 Days", difficulty:"Medium", price:12000, img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop", tag:"🤿 Underwater", rating:4.7, groupSize:"4-8", includes:["Instructor","Equipment","Boat","Meals"] },
  { id:4, title:"Bungee Jump Rishikesh", cat:"Bungee", location:"Rishikesh, Uttarakhand", duration:"Half Day", difficulty:"Extreme", price:3500, img:"https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=400&h=250&fit=crop", tag:"🎯 Adrenaline", rating:4.6, groupSize:"1-2", includes:["Safety gear","Certificate","Video"] },
  { id:5, title:"Paragliding in Bir Billing", cat:"Paragliding", location:"Himachal Pradesh", duration:"1 Day", difficulty:"Medium", price:2500, img:"https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=250&fit=crop", tag:"🪁 Fly High", rating:4.8, groupSize:"1-2", includes:["Pilot","Equipment","Photos","Video"] },
  { id:6, title:"Rishikesh River Rafting", cat:"Rafting", location:"Rishikesh, Uttarakhand", duration:"1 Day", difficulty:"Medium", price:1500, img:"https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=400&h=250&fit=crop", tag:"🌊 Rapids", rating:4.7, groupSize:"6-10", includes:["Guide","Equipment","Lunch","Transport"] },
  { id:7, title:"Coorg Camping & Trek", cat:"Camping", location:"Coorg, Karnataka", duration:"2 Days", difficulty:"Easy", price:4500, img:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=250&fit=crop", tag:"⛺ Nature", rating:4.5, groupSize:"10-20", includes:["Tent","Meals","Guide","Bonfire"] },
  { id:8, title:"Ladakh Cycling Expedition", cat:"Cycling", location:"Ladakh, J&K", duration:"10 Days", difficulty:"Hard", price:35000, img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop", tag:"🚴 Adventure", rating:4.9, groupSize:"6-12", includes:["Cycle","Guide","Accommodation","Meals","Support vehicle"] },
];

const DIFF_COLOR = { Easy:"text-green-400 bg-green-500/10", Medium:"text-yellow-400 bg-yellow-500/10", Hard:"text-orange-400 bg-orange-500/10", Extreme:"text-red-400 bg-red-500/10" };

export default function AdventureBooking() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState(new Set());
  const [showModal, setShowModal] = useState(null);
  const [qty, setQty] = useState(1);
  const [booked, setBooked] = useState(false);

  const filtered = ADVENTURES.filter(a =>
    (cat === "All" || a.cat === cat) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">🏔️ Adventure</h1>
          <p className="text-white/80 text-xs">Treks, skydiving & extreme sports</p>
        </div>
      </div>

      {booked && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-semibold flex items-center gap-2 animate-bounce">
          <HiCheckCircle size={18} /> Adventure booked! Get ready! 🎉
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-xl px-3 py-2.5">
          <FaSearch className="text-theme-muted" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search adventures..."
            className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-muted" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${cat === c ? "bg-emerald-600 text-white" : "bg-theme-card border border-theme text-theme-muted"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(adv => (
            <div key={adv.id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all">
              <div className="relative">
                <img src={adv.img} alt={adv.title} className="w-full h-44 object-cover" />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">{adv.tag}</span>
                <span className={`absolute top-2 right-8 text-[10px] px-2 py-0.5 rounded-full font-semibold ${DIFF_COLOR[adv.difficulty]}`}>{adv.difficulty}</span>
                <button onClick={() => setWishlist(p => { const s = new Set(p); s.has(adv.id) ? s.delete(adv.id) : s.add(adv.id); return s; })}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                  {wishlist.has(adv.id) ? <FaHeart size={10} className="text-red-400" /> : <FaRegHeart size={10} className="text-white" />}
                </button>
              </div>
              <div className="p-3">
                <p className="font-bold text-theme-primary text-sm">{adv.title}</p>
                <p className="text-xs text-theme-muted flex items-center gap-1 mt-0.5"><FaMapMarkerAlt size={9} />{adv.location}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-theme-muted">
                  <span className="flex items-center gap-1"><FaClock size={9} />{adv.duration}</span>
                  <span className="flex items-center gap-1"><FaUsers size={9} />{adv.groupSize}</span>
                  <span className="flex items-center gap-1"><FaStar size={9} className="text-yellow-400" />{adv.rating}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="font-bold text-emerald-400 text-base">₹{adv.price.toLocaleString()}</span>
                    <span className="text-xs text-theme-muted ml-1">/ person</span>
                  </div>
                  <button onClick={() => { setShowModal(adv); setQty(1); }}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center">
          <div className="w-full max-w-md bg-theme-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-theme-primary">{showModal.title}</p>
              <button onClick={() => setShowModal(null)}><HiX size={20} className="text-theme-muted" /></button>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {showModal.includes.map(inc => (
                <span key={inc} className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <HiCheckCircle size={10} /> {inc}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-theme-primary">Participants</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full bg-theme-input border border-theme font-bold text-theme-primary">−</button>
                <span className="font-bold text-theme-primary w-6 text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(12, q + 1))} className="w-8 h-8 rounded-full bg-theme-input border border-theme font-bold text-theme-primary">+</button>
              </div>
            </div>
            <div className="bg-theme-input rounded-xl p-3 mb-4">
              <div className="flex justify-between text-sm text-theme-muted"><span>{qty} × ₹{showModal.price.toLocaleString()}</span><span>₹{(qty * showModal.price).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-theme-primary border-t border-theme mt-2 pt-2">
                <span>Total</span><span className="text-emerald-400">₹{(qty * showModal.price).toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => { setBooked(true); setShowModal(null); setTimeout(() => setBooked(false), 3000); }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl text-[15px]">
              Book Adventure · ₹{(qty * showModal.price).toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
