import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaMapMarkerAlt, FaStar, FaCut, FaHeart, FaRegHeart } from "react-icons/fa";
import { HiX, HiClock } from "react-icons/hi";

const SERVICES = ["All", "Haircut", "Facial", "Massage", "Manicure", "Pedicure", "Waxing", "Bridal"];

const SALONS = [
  { id:1, name:"Lakme Salon", type:"Unisex", location:"Bandra West", rating:4.7, reviews:342, img:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop", tag:"⭐ Top Rated", services:[{name:"Haircut",price:499,time:"45 min"},{name:"Facial",price:1299,time:"60 min"},{name:"Massage",price:999,time:"60 min"},{name:"Manicure",price:599,time:"45 min"}] },
  { id:2, name:"Naturals Salon", type:"Women", location:"Andheri East", rating:4.5, reviews:218, img:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=250&fit=crop", tag:"💆 Wellness", services:[{name:"Haircut",price:399,time:"30 min"},{name:"Facial",price:999,time:"60 min"},{name:"Waxing",price:299,time:"30 min"},{name:"Pedicure",price:499,time:"45 min"}] },
  { id:3, name:"Enrich Salon", type:"Unisex", location:"Powai", rating:4.8, reviews:567, img:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop", tag:"🌟 Premium", services:[{name:"Haircut",price:699,time:"45 min"},{name:"Bridal",price:8999,time:"4 hr"},{name:"Massage",price:1499,time:"90 min"},{name:"Facial",price:1799,time:"75 min"}] },
  { id:4, name:"Jawed Habib", type:"Men", location:"Malad", rating:4.3, reviews:189, img:"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=250&fit=crop", tag:"✂️ Men's", services:[{name:"Haircut",price:299,time:"30 min"},{name:"Shave",price:199,time:"20 min"},{name:"Facial",price:799,time:"45 min"},{name:"Massage",price:699,time:"45 min"}] },
];

const SLOTS = ["10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];

export default function SalonBooking() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [wishlist, setWishlist] = useState(new Set());
  const [showModal, setShowModal] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [booked, setBooked] = useState(false);

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">💇 Salon & Spa</h1>
          <p className="text-white/80 text-xs">Book beauty & wellness services</p>
        </div>
      </div>

      {booked && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-semibold animate-bounce">
          ✅ Appointment confirmed!
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-xl px-3 py-2.5">
          <FaSearch className="text-theme-muted" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search salons..."
            className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-muted" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {SERVICES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${filter === s ? "bg-pink-500 text-white" : "bg-theme-card border border-theme text-theme-muted"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {SALONS.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase())).map(salon => (
            <div key={salon.id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden hover:border-pink-500/40 transition-all">
              <div className="relative">
                <img src={salon.img} alt={salon.name} className="w-full h-44 object-cover" />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">{salon.tag}</span>
                <span className="absolute top-2 right-10 bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full">{salon.type}</span>
                <button onClick={() => setWishlist(p => { const s = new Set(p); s.has(salon.id) ? s.delete(salon.id) : s.add(salon.id); return s; })}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center">
                  {wishlist.has(salon.id) ? <FaHeart size={12} className="text-red-400" /> : <FaRegHeart size={12} className="text-white" />}
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-theme-primary">{salon.name}</p>
                    <p className="text-xs text-theme-muted flex items-center gap-1 mt-0.5"><FaMapMarkerAlt size={9} />{salon.location}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <FaStar size={10} className="text-yellow-400" />
                      <span className="text-xs font-semibold">{salon.rating}</span>
                      <span className="text-xs text-theme-muted">({salon.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {salon.services.map(svc => (
                    <button key={svc.name} onClick={() => { setShowModal(salon); setSelectedService(svc); setSelectedSlot(""); }}
                      className="flex items-center justify-between p-2.5 bg-theme-input border border-theme rounded-xl hover:border-pink-500/50 transition text-left">
                      <div>
                        <p className="text-xs font-semibold text-theme-primary">{svc.name}</p>
                        <p className="text-[10px] text-theme-muted flex items-center gap-0.5"><HiClock size={8} />{svc.time}</p>
                      </div>
                      <span className="text-xs font-bold text-pink-400">₹{svc.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedService && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center">
          <div className="w-full max-w-md bg-theme-card rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-theme-primary">{showModal.name}</p>
              <button onClick={() => setShowModal(null)}><HiX size={20} className="text-theme-muted" /></button>
            </div>
            <p className="text-sm text-pink-400 font-semibold mb-4">{selectedService.name} · ₹{selectedService.price} · {selectedService.time}</p>
            <p className="text-xs text-theme-muted mb-2">Choose time slot</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {SLOTS.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${selectedSlot === slot ? "bg-pink-500 text-white border-pink-500" : "border-theme text-theme-muted hover:border-pink-500"}`}>
                  {slot}
                </button>
              ))}
            </div>
            <button disabled={!selectedSlot}
              onClick={() => { setBooked(true); setShowModal(null); setTimeout(() => setBooked(false), 3000); }}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl disabled:opacity-40 text-[15px]">
              {selectedSlot ? `Confirm · ₹${selectedService.price}` : "Select a time slot"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
