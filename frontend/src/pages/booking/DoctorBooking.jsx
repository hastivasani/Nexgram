import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaMapMarkerAlt, FaStar, FaUserMd, FaHeart, FaRegHeart, FaVideo } from "react-icons/fa";
import { HiX, HiClock, HiCheckCircle } from "react-icons/hi";

const SPECIALITIES = ["All", "General", "Dermatologist", "Dentist", "Cardiologist", "Orthopedic", "Gynecologist", "Pediatrician", "Psychiatrist"];

const DOCTORS = [
  { id:1, name:"Dr. Priya Sharma", spec:"Dermatologist", exp:"12 yrs", location:"Bandra, Mumbai", rating:4.9, reviews:892, fee:800, img:"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop", tag:"⭐ Top Doctor", video:true, slots:["10:00 AM","11:30 AM","2:00 PM","4:30 PM","6:00 PM"] },
  { id:2, name:"Dr. Rahul Mehta", spec:"Cardiologist", exp:"18 yrs", location:"Andheri, Mumbai", rating:4.8, reviews:1204, fee:1200, img:"https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop", tag:"🏥 Senior", video:true, slots:["9:00 AM","11:00 AM","3:00 PM","5:00 PM"] },
  { id:3, name:"Dr. Sneha Patel", spec:"Pediatrician", exp:"8 yrs", location:"Powai, Mumbai", rating:4.7, reviews:567, fee:600, img:"https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop", tag:"👶 Kids Specialist", video:false, slots:["10:30 AM","12:00 PM","4:00 PM","6:30 PM"] },
  { id:4, name:"Dr. Amit Kumar", spec:"Dentist", exp:"10 yrs", location:"Malad, Mumbai", rating:4.6, reviews:423, fee:500, img:"https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop", tag:"🦷 Dental", video:false, slots:["9:30 AM","11:00 AM","2:30 PM","5:30 PM"] },
  { id:5, name:"Dr. Neha Joshi", spec:"Gynecologist", exp:"15 yrs", location:"Juhu, Mumbai", rating:4.9, reviews:1089, fee:1000, img:"https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop", tag:"⭐ Top Rated", video:true, slots:["10:00 AM","12:00 PM","3:00 PM","5:00 PM"] },
  { id:6, name:"Dr. Vikram Singh", spec:"Orthopedic", exp:"20 yrs", location:"Dadar, Mumbai", rating:4.7, reviews:678, fee:900, img:"https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop", tag:"🦴 Bone Specialist", video:false, slots:["9:00 AM","11:30 AM","2:00 PM","4:00 PM"] },
];

export default function DoctorBooking() {
  const navigate = useNavigate();
  const [spec, setSpec] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState(new Set());
  const [showModal, setShowModal] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [consultType, setConsultType] = useState("clinic");
  const [booked, setBooked] = useState(false);

  const filtered = DOCTORS.filter(d =>
    (spec === "All" || d.spec === spec) &&
    (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.spec.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-[68px] md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">🏥 Doctor Appointment</h1>
          <p className="text-white/80 text-xs">Book clinic or video consultation</p>
        </div>
      </div>

      {booked && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-semibold flex items-center gap-2 animate-bounce">
          <HiCheckCircle size={18} /> Appointment confirmed!
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-xl px-3 py-2.5">
          <FaSearch className="text-theme-muted" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors or speciality..."
            className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-muted" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {SPECIALITIES.map(s => (
            <button key={s} onClick={() => setSpec(s)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${spec === s ? "bg-blue-600 text-white" : "bg-theme-card border border-theme text-theme-muted"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-theme-card border border-theme rounded-2xl p-4 hover:border-blue-500/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <img src={doc.img} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                  {doc.video && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><FaVideo size={8} className="text-white" /></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-theme-primary text-sm">{doc.name}</p>
                      <p className="text-xs text-blue-400 font-semibold">{doc.spec}</p>
                      <p className="text-xs text-theme-muted">{doc.exp} experience</p>
                    </div>
                    <button onClick={() => setWishlist(p => { const s = new Set(p); s.has(doc.id) ? s.delete(doc.id) : s.add(doc.id); return s; })}>
                      {wishlist.has(doc.id) ? <FaHeart size={14} className="text-red-400" /> : <FaRegHeart size={14} className="text-theme-muted" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-theme-muted">
                    <span className="flex items-center gap-0.5"><FaStar size={9} className="text-yellow-400" />{doc.rating} ({doc.reviews})</span>
                    <span className="flex items-center gap-0.5"><FaMapMarkerAlt size={9} />{doc.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-blue-400">₹{doc.fee} <span className="text-xs text-theme-muted font-normal">/ visit</span></span>
                    <button onClick={() => { setShowModal(doc); setSelectedSlot(""); setConsultType("clinic"); }}
                      className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-xs font-bold">
                      Book Now
                    </button>
                  </div>
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
              <div>
                <p className="font-bold text-theme-primary">{showModal.name}</p>
                <p className="text-xs text-blue-400">{showModal.spec}</p>
              </div>
              <button onClick={() => setShowModal(null)}><HiX size={20} className="text-theme-muted" /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setConsultType("clinic")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${consultType === "clinic" ? "bg-blue-600 text-white border-blue-600" : "border-theme text-theme-muted"}`}>
                🏥 Clinic Visit
              </button>
              {showModal.video && (
                <button onClick={() => setConsultType("video")}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${consultType === "video" ? "bg-green-600 text-white border-green-600" : "border-theme text-theme-muted"}`}>
                  📹 Video Call
                </button>
              )}
            </div>
            <p className="text-xs text-theme-muted mb-2">Available slots</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {showModal.slots.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${selectedSlot === slot ? "bg-blue-600 text-white border-blue-600" : "border-theme text-theme-muted hover:border-blue-500"}`}>
                  {slot}
                </button>
              ))}
            </div>
            <div className="bg-theme-input rounded-xl p-3 mb-4 flex justify-between text-sm">
              <span className="text-theme-muted">Consultation fee</span>
              <span className="font-bold text-blue-400">₹{showModal.fee}</span>
            </div>
            <button disabled={!selectedSlot}
              onClick={() => { setBooked(true); setShowModal(null); setTimeout(() => setBooked(false), 3000); }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl disabled:opacity-40 text-[15px]">
              {selectedSlot ? `Confirm Appointment · ₹${showModal.fee}` : "Select a slot"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
