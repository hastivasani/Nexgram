const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB().then(async () => {
  // One-time migration: set source="post" for all posts missing source field
  try {
    const Post = require("./models/Post");
    const result = await Post.updateMany(
      { source: { $in: [null, undefined] }, $or: [{ source: { $exists: false } }, { source: null }] },
      { $set: { source: "post" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Migration] Set source="post" for ${result.modifiedCount} posts`);
    }
  } catch (e) {
    console.error("[Migration] Failed:", e.message);
  }
});

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://localhost:5173",
  "http://192.168.29.58:5173",
  "https://192.168.29.58:5173",
].filter(Boolean);

// Allow all vercel.app and onrender.com origins dynamically
const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /\.onrender\.com$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track online users: userId -> socketId
const onlineUsers = new Map();
// Track active live streams: hostUserId -> { socketId, hostName, hostAvatar, viewers, likes }
const liveStreams  = new Map();
// Track voice rooms: roomId -> Set of userIds
const voiceRooms   = new Map();
// Track game lobbies in memory: lobbyId -> gameState
const gameStates   = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`[Socket] User ${userId} connected with socket ${socket.id}`);
  if (userId) {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log(`[Socket] Online users now:`, Array.from(onlineUsers.keys()));
  }

  // ── WebRTC 1-on-1 Calls ──────────────────────────────────────
  socket.on("callUser", ({ to, signal, from, callerName, callerAvatar, callType }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("incomingCall", { signal, from, callerName, callerAvatar, callType });
    }
  });
  socket.on("answerCall", ({ to, signal }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("callAccepted", { signal });
  });
  socket.on("endCall", ({ to }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("callEnded");
  });
  socket.on("iceCandidate", ({ to, candidate }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("iceCandidate", { candidate });
  });

  // ── Group Chat ───────────────────────────────────────────────
  socket.on("joinGroup", ({ groupId }) => {
    socket.join("group_" + groupId);
  });
  socket.on("leaveGroup", ({ groupId }) => {
    socket.leave("group_" + groupId);
  });
  socket.on("groupTyping", ({ groupId, username }) => {
    socket.to("group_" + groupId).emit("groupTyping", { username });
  });

  // ── Group Calls (new signaling) ───────────────────────────────
  socket.on("gcJoin", ({ groupId, userId: joinUserId, username, callType, callerName, callerAvatar, members }) => {
    console.log(`[gcJoin] ${username} (${joinUserId}) joining group ${groupId}`);
    console.log(`[gcJoin] Online users:`, Array.from(onlineUsers.keys()));
    console.log(`[gcJoin] Members to notify:`, members);
    socket.join("gc_" + groupId);
    members?.forEach(memberId => {
      const key = String(memberId);
      const ms = onlineUsers.get(key);
      console.log(`  → member ${key}: socket ${ms ? ms : "NOT FOUND"}`);
      if (ms) io.to(ms).emit("incomingGroupCall", { groupId, callType, callerName, callerAvatar, callerId: joinUserId });
    });
    socket.to("gc_" + groupId).emit("gcPeerJoined", { userId: joinUserId, username });
  });

  // Direct WebRTC signaling — route to specific user
  socket.on("gcOffer",  ({ to, signal, username }) => {
    const ts = onlineUsers.get(to?.toString());
    if (ts) io.to(ts).emit("gcOffer", { from: userId, signal, username });
  });
  socket.on("gcAnswer", ({ to, signal }) => {
    const ts = onlineUsers.get(to?.toString());
    if (ts) io.to(ts).emit("gcAnswer", { from: userId, signal });
  });
  socket.on("gcIce",    ({ to, candidate }) => {
    const ts = onlineUsers.get(to?.toString());
    if (ts) io.to(ts).emit("gcIce", { from: userId, candidate });
  });
  socket.on("gcEnd",    ({ groupId }) => {
    io.to("gc_" + groupId).emit("gcEnded", { groupId });
    socket.leave("gc_" + groupId);
  });
  socket.on("gcLeave",  ({ groupId }) => {
    socket.to("gc_" + groupId).emit("gcPeerLeft", { userId });
    socket.leave("gc_" + groupId);
  });

  // ── Voice Rooms (Discord-style) ──────────────────────────────
  socket.on("joinVoiceRoom", ({ roomId }) => {
    socket.join("voice_" + roomId);
    if (!voiceRooms.has(roomId)) voiceRooms.set(roomId, new Set());
    voiceRooms.get(roomId).add(userId);
    socket.to("voice_" + roomId).emit("voiceRoomUserJoined", {
      userId,
      count: voiceRooms.get(roomId).size,
    });
  });
  socket.on("leaveVoiceRoom", ({ roomId }) => {
    socket.leave("voice_" + roomId);
    voiceRooms.get(roomId)?.delete(userId);
    socket.to("voice_" + roomId).emit("voiceRoomUserLeft", {
      userId,
      count: voiceRooms.get(roomId)?.size || 0,
    });
  });
  // WebRTC signaling for voice rooms (mesh)
  socket.on("voiceRoomOffer", ({ roomId, to, signal }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("voiceRoomOffer", { from: userId, signal, roomId });
  });
  socket.on("voiceRoomAnswer", ({ to, signal, roomId }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("voiceRoomAnswer", { from: userId, signal, roomId });
  });
  socket.on("voiceRoomIce", ({ to, candidate }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("voiceRoomIce", { from: userId, candidate });
  });

  // ── Live Streaming ────────────────────────────────────────────
  socket.on("startLive", ({ hostId, hostName, hostAvatar, followers }) => {
    liveStreams.set(hostId, { socketId: socket.id, hostName, hostAvatar, viewers: new Set(), likes: 0 });
    followers?.forEach(fid => {
      const fs = onlineUsers.get(fid);
      if (fs) io.to(fs).emit("liveStarted", { hostId, hostName, hostAvatar });
    });
  });
  socket.on("joinLive", ({ hostId, viewerId, viewerName }) => {
    const live = liveStreams.get(hostId);
    if (!live) return socket.emit("liveEnded");
    live.viewers.add(viewerId);
    socket.join("live_" + hostId);
    io.to(live.socketId).emit("viewerJoined", { viewerId, viewerName, count: live.viewers.size });
    socket.emit("liveViewerCount", { count: live.viewers.size });
  });
  socket.on("liveOffer",  ({ hostId, viewerId, signal }) => {
    const live = liveStreams.get(hostId);
    if (live) io.to(live.socketId).emit("liveOffer", { viewerId, signal });
  });
  socket.on("liveAnswer", ({ viewerId, signal }) => {
    const vs = onlineUsers.get(viewerId);
    if (vs) io.to(vs).emit("liveAnswer", { signal });
  });
  socket.on("liveIce", ({ to, candidate, isHost, hostId }) => {
    if (isHost) {
      const vs = onlineUsers.get(to);
      if (vs) io.to(vs).emit("liveIce", { candidate });
    } else {
      const live = liveStreams.get(hostId);
      if (live) io.to(live.socketId).emit("liveIce", { candidate, from: to });
    }
  });
  socket.on("liveComment", ({ hostId, viewerName, text }) => {
    io.to("live_" + hostId).emit("liveComment", { viewerName, text });
    const live = liveStreams.get(hostId);
    if (live) io.to(live.socketId).emit("liveComment", { viewerName, text });
  });
  socket.on("liveLike", ({ hostId, viewerName }) => {
    const live = liveStreams.get(hostId);
    if (!live) return;
    live.likes++;
    io.to("live_" + hostId).emit("liveLike", { count: live.likes, viewerName });
    io.to(live.socketId).emit("liveLike", { count: live.likes, viewerName });
  });
  socket.on("liveEmoji", ({ hostId, emoji, viewerName }) => {
    io.to("live_" + hostId).emit("liveEmoji", { emoji, viewerName });
    const live = liveStreams.get(hostId);
    if (live) io.to(live.socketId).emit("liveEmoji", { emoji, viewerName });
  });
  socket.on("liveGift", ({ hostId, viewerName, gift, value }) => {
    const live = liveStreams.get(hostId);
    io.to("live_" + hostId).emit("liveGift", { viewerName, gift, value });
    if (live) io.to(live.socketId).emit("liveGift", { viewerName, gift, value });
  });
  socket.on("endLive", ({ hostId, followers }) => {
    liveStreams.delete(hostId);
    io.to("live_" + hostId).emit("liveEnded");
    followers?.forEach(fid => {
      const fs = onlineUsers.get(fid);
      if (fs) io.to(fs).emit("liveEnded_" + hostId);
    });
  });
  socket.on("leaveLive", ({ hostId, viewerId }) => {
    const live = liveStreams.get(hostId);
    if (live) {
      live.viewers.delete(viewerId);
      io.to(live.socketId).emit("viewerLeft", { viewerId, count: live.viewers.size });
    }
    socket.leave("live_" + hostId);
  });

  // ── Gaming ────────────────────────────────────────────────────
  socket.on("joinLobby", ({ lobbyId }) => {
    socket.join("lobby_" + lobbyId);
  });
  socket.on("leaveLobby", ({ lobbyId }) => {
    socket.leave("lobby_" + lobbyId);
  });
  socket.on("gameAction", ({ lobbyId, action, payload }) => {
    // Relay game actions to all players in lobby
    socket.to("lobby_" + lobbyId).emit("gameAction", { from: userId, action, payload });
  });
  socket.on("gameStateUpdate", ({ lobbyId, state }) => {
    gameStates.set(lobbyId, state);
    io.to("lobby_" + lobbyId).emit("gameStateUpdate", { state });
  });
  socket.on("gameOver", ({ lobbyId, winner }) => {
    io.to("lobby_" + lobbyId).emit("gameOver", { winner });
    gameStates.delete(lobbyId);
  });
  socket.on("inviteToGame", ({ to, lobbyId, game, inviteCode, fromName }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("gameInvite", { lobbyId, game, inviteCode, fromName, from: userId });
  });

  // ── Typing indicators (DM) ────────────────────────────────────
  socket.on("typing", ({ to }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("typing", { from: userId });
  });
  socket.on("stopTyping", ({ to }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("stopTyping", { from: userId });
  });

  // ── Seen receipts ─────────────────────────────────────────────
  socket.on("seen", ({ to }) => {
    const t = onlineUsers.get(to);
    if (t) io.to(t).emit("messageSeen", { by: userId });
  });

  // ── Disconnect ────────────────────────────────────────────────
  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    // Clean up voice rooms
    voiceRooms.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);
        io.to("voice_" + roomId).emit("voiceRoomUserLeft", { userId, count: users.size });
      }
    });
  });
});

app.set("io", io);
app.set("onlineUsers", onlineUsers);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

const { apiLimiter, authLimiter, resetLimiter } = require("./middleware/rateLimiter");
app.use("/api/", apiLimiter);

// Routes
app.use("/api/auth",          authLimiter, require("./routes/authRoutes"));
app.use("/api/users",         require("./routes/userRoutes"));
app.use("/api/posts",         require("./routes/postRoutes"));
app.use("/api/stories",       require("./routes/storyRoutes"));
app.use("/api/reels",         require("./routes/reelRoutes"));
app.use("/api/messages",      require("./routes/messageRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/notes",         require("./routes/noteRoutes"));
app.use("/api/groups",        require("./routes/groupRoutes"));
app.use("/api/gaming",        require("./routes/gameRoutes"));
app.use("/api/voice-rooms",   require("./routes/voiceRoomRoutes"));
// New routes
app.use("/api/shop",          require("./routes/shopRoutes"));
app.use("/api/booking",       require("./routes/bookingRoutes"));
app.use("/api/video",         require("./routes/videoRoutes"));
app.use("/api/search",        require("./routes/searchRoutes"));
app.use("/api/password",      resetLimiter, require("./routes/passwordResetRoutes"));
app.use("/api/news",          require("./routes/newsRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));
app.use("/api/push",          require("./routes/pushRoutes"));

// One-time seed endpoint — remove after use
app.get("/api/seed-products", async (req, res) => {
  if (req.query.key !== "seed2026") return res.status(403).json({ message: "forbidden" });
  try {
    const Product = require("./models/Product");
    const User    = require("./models/User");

    const count = await Product.countDocuments();
    if (count > 0) {
      // Just mark all existing as active
      await Product.updateMany({}, { $set: { isActive: true } });
      return res.json({ message: `Updated ${count} products to isActive:true` });
    }

    const user = await User.findOne();
    if (!user) return res.status(400).json({ message: "No users found" });

    const sampleProducts = require("./seedProducts");
    res.json({ message: "Use POST /api/seed-products with key to seed" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/seed-products", async (req, res) => {
  if (req.query.key !== "seed2026") return res.status(403).json({ message: "forbidden" });
  try {
    const Product = require("./models/Product");
    const User    = require("./models/User");

    // First just activate existing products
    const existing = await Product.countDocuments();
    if (existing > 0) {
      await Product.updateMany({}, { $set: { isActive: true } });
      return res.json({ message: `Activated ${existing} existing products` });
    }

    const user = await User.findOne();
    if (!user) return res.status(400).json({ message: "No users found" });

    const products = [
      { name: "Wireless Bluetooth Headphones", description: "Premium sound quality with active noise cancellation.", price: 49.99, comparePrice: 79.99, category: "Electronics", stock: 25, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"], rating: 4.5, reviewCount: 128, seller: user._id, isActive: true },
      { name: "Mechanical Gaming Keyboard", description: "RGB backlit mechanical keyboard with tactile switches.", price: 69.99, comparePrice: 99.99, category: "Electronics", stock: 15, images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop"], rating: 4.7, reviewCount: 89, seller: user._id, isActive: true },
      { name: "Minimalist Leather Wallet", description: "Slim RFID-blocking genuine leather wallet.", price: 24.99, category: "Fashion", stock: 50, images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop"], rating: 4.3, reviewCount: 214, seller: user._id, isActive: true },
      { name: "Stainless Steel Water Bottle", description: "Double-wall vacuum insulated 32oz bottle.", price: 19.99, comparePrice: 29.99, category: "Sports", stock: 80, images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop"], rating: 4.6, reviewCount: 342, seller: user._id, isActive: true },
      { name: "Wireless Charging Pad", description: "10W fast wireless charger compatible with all Qi-enabled devices.", price: 15.99, comparePrice: 24.99, category: "Electronics", stock: 60, images: ["https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=400&h=400&fit=crop"], rating: 4.1, reviewCount: 203, seller: user._id, isActive: true },
      { name: "Ceramic Coffee Mug", description: "Handcrafted 12oz ceramic mug with minimalist design.", price: 14.99, category: "Home & Garden", stock: 75, images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop"], rating: 4.5, reviewCount: 87, seller: user._id, isActive: true },
      { name: "Bluetooth Speaker Mini", description: "Compact waterproof Bluetooth 5.0 speaker.", price: 39.99, comparePrice: 59.99, category: "Electronics", stock: 20, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop"], rating: 4.4, reviewCount: 311, seller: user._id, isActive: true },
      { name: "Sunglasses UV400", description: "Polarized UV400 protection sunglasses.", price: 22.99, comparePrice: 39.99, category: "Fashion", stock: 45, images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop"], rating: 4.3, reviewCount: 175, seller: user._id, isActive: true },
    ];

    await Product.insertMany(products);
    res.json({ message: `Seeded ${products.length} products!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// One-time migration endpoint
app.post("/api/migrate-data", async (req, res) => {
  if (req.query.key !== "migrate2026") return res.status(403).json({ message: "forbidden" });
  try {
    const User    = require("./models/User");
    const Product = require("./models/Product");
    const { users = [], products = [] } = req.body;
    let uCount = 0, pCount = 0;
    for (const u of users) {
      const { _id, ...rest } = u;
      await User.replaceOne({ _id }, { _id, ...rest }, { upsert: true });
      uCount++;
    }
    for (const p of products) {
      const { _id, ...rest } = p;
      await Product.replaceOne({ _id }, { _id, ...rest }, { upsert: true });
      pCount++;
    }
    res.json({ message: "Migration done!", users: uCount, products: pCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Make user admin by username or email (one-time setup)
app.post("/api/make-admin", async (req, res) => {
  if (req.query.key !== "admin2026") return res.status(403).json({ message: "forbidden" });
  try {
    const User = require("./models/User");
    const { username, email } = req.body;
    const query = username ? { username } : { email };
    const user = await User.findOneAndUpdate(query, { isAdmin: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `${user.username} (${user.email}) is now admin!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
