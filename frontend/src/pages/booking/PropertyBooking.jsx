import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaMapMarkerAlt, FaStar, FaHeart, FaRegHeart, FaBed, FaBath, FaRulerCombined, FaBuilding } from "react-icons/fa";
import { HiX, HiPhone, HiMail } from "react-icons/hi";

const TYPES = ["All", "Apartment", "Villa", "Studio", "PG/Hostel", "Office", "Shop"];
const PURPOSES = ["Buy", "Rent", "PG"];

const PROPERTIES = [
  { id:1, title:"3 BHK Luxury Apartment", type:"Apartment", purpose:"Buy", location:"Bandra West, Mumbai", price:"₹2.8 Cr", area:"1450 sqft", beds:3, baths:2, img:"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop", tag:"🔥 Hot Deal", rating:4.8, builder:"Lodha Group" },
  { id:2, title:"2 BHK Sea View Flat", type:"Apartment", purpose:"Rent", location:"Worli, Mumbai", price:"₹85,000/mo", area:"1100 sqft", beds:2, baths:2, img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop", tag:"🌊 Sea View", rating:4.6, builder:"Oberoi Realty" },
  { id:3, title:"Studio Apartment", type:"Studio", purpose:"Rent", location:"Andheri East, Mumbai", price:"₹28,000/mo", area:"450 sqft", beds:1, baths:1, img:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop", tag:"🏠 Cozy", rating:4.3, builder:"Individual" },
  { id:4, title:"4 BHK Villa", type:"Villa", purpose:"Buy", location:"Lonavala", price:"₹1.2 Cr", area:"3200 sqft", beds:4, baths:3, img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop", tag:"🌿 Nature", rating:4.9, builder:"Mahindra Lifespaces" },
  { id:5, title:"PG for Working Professionals", type:"PG/Hostel", purpose:"PG", location:"Powai, Mumbai", price:"₹12,000/mo", area:"200 sqft", beds:1, baths:1, img:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=250&fit=crop", tag:"🏢 PG", rating:4.2, builder:"Stanza Living" },
  { id:6, title:"Commercial Office Space", type:"Office", purpose:"Rent", location:"BKC, Mumbai", price:"₹2,50,000/mo", area:"5000 sqft", beds:0, baths:4, img:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop", tag:"💼 Commercial", rating:4.7, builder:"DLF" },
];

export default function PropertyBooking() {
  const navigate = useNavigate();
  const [type, setType] = useState("All");
  const [purpose, setPurpose] = useState("Buy");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState(new Set());
  const [showModal, setShowModal] = useState(null);
  const [contacted, setContacted] = useState(new Set());

  const filtered = PROPERTIES.filter(p =>
    (type === "All" || p.type === type) &&
    p.purpose === purpose &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">🏠 Property</h1>
          <p className="text-white/80 text-xs">Buy, Rent or find PG</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Purpose tabs */}
        <div className="flex gap-2 bg-theme-card border border-theme rounded-xl p-1">
          {PURPOSES.map(p => (
            <button key={p} onClick={() => setPurpose(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${purpose === p ? "bg-amber-600 text-white" : "text-theme-muted"}`}>
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-xl px-3 py-2.5">
          <FaSearch className="text-theme-muted" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search location, property..."
            className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-muted" />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${type === t ? "bg-amber-600 text-white" : "bg-theme-card border border-theme text-theme-muted"}`}>
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-theme-muted">
            <FaBuilding size={40} className="mx-auto mb-3 opacity-20" />
            <p>No properties found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(prop => (
              <div key={prop.id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all cursor-pointer"
                onClick={() => setShowModal(prop)}>
                <div className="relative">
                  <img src={prop.img} alt={prop.title} className="w-full h-44 object-cover" />
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">{prop.tag}</span>
                  <button onClick={e => { e.stopPropagation(); setWishlist(p => { const s = new Set(p); s.has(prop.id) ? s.delete(prop.id) : s.add(prop.id); return s; }); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center">
                    {wishlist.has(prop.id) ? <FaHeart size={12} className="text-red-400" /> : <FaRegHeart size={12} className="text-white" />}
                  </button>
                </div>
                <div className="p-3">
                  <p className="font-bold text-amber-400 text-base">{prop.price}</p>
                  <p className="font-semibold text-theme-primary text-sm mt-0.5">{prop.title}</p>
                  <p className="text-xs text-theme-muted flex items-center gap-1 mt-0.5"><FaMapMarkerAlt size={9} />{prop.location}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-theme-muted">
                    {prop.beds > 0 && <span className="flex items-center gap-1"><FaBed size={10} />{prop.beds} Beds</span>}
                    <span className="flex items-center gap-1"><FaBath size={10} />{prop.baths} Baths</span>
                    <span className="flex items-center gap-1"><FaRulerCombined size={10} />{prop.area}</span>
                  </div>
                  <p className="text-[10px] text-theme-muted mt-1">By {prop.builder}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center">
          <div className="w-full max-w-md bg-theme-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-theme-primary">{showModal.title}</p>
              <button onClick={() => setShowModal(null)}><HiX size={20} className="text-theme-muted" /></button>
            </div>
            <img src={showModal.img} className="w-full h-40 object-cover rounded-xl mb-4" alt="" />
            <p className="text-xl font-bold text-amber-400 mb-1">{showModal.price}</p>
            <p className="text-sm text-theme-muted flex items-center gap-1 mb-3"><FaMapMarkerAlt size={11} />{showModal.location}</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {showModal.beds > 0 && <div className="bg-theme-input rounded-xl p-2 text-center"><FaBed className="mx-auto text-amber-400 mb-1" /><p className="text-xs font-semibold">{showModal.beds} Beds</p></div>}
              <div className="bg-theme-input rounded-xl p-2 text-center"><FaBath className="mx-auto text-amber-400 mb-1" /><p className="text-xs font-semibold">{showModal.baths} Baths</p></div>
              <div className="bg-theme-input rounded-xl p-2 text-center"><FaRulerCombined className="mx-auto text-amber-400 mb-1" /><p className="text-xs font-semibold">{showModal.area}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setContacted(p => new Set([...p, showModal.id])); setShowModal(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold">
                <HiPhone /> Contact Agent
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-amber-600 text-amber-600 rounded-xl font-bold">
                <HiMail /> Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
