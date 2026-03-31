const mongoose = require("mongoose");

const qnaSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question:   { type: String, required: true, maxlength: 300 },
  answer:     { type: String, default: "" },
  isAnswered: { type: Boolean, default: false },
  isAnonymous:{ type: Boolean, default: true },
  askedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

module.exports = mongoose.model("QnA", qnaSchema);
