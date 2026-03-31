const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const QnA  = require("../models/QnA");
const User = require("../models/User");

// Ask anonymous question to a user (no auth needed)
router.post("/:username/ask", async (req, res) => {
  try {
    const { question, isAnonymous = true } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: "Question required" });
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });
    const q = await QnA.create({
      recipient: user._id,
      question:  question.trim(),
      isAnonymous,
    });
    res.status(201).json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get my questions (inbox)
router.get("/inbox", protect, async (req, res) => {
  try {
    const questions = await QnA.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    res.json(questions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get answered questions for a profile (public)
router.get("/:username/answered", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });
    const questions = await QnA.find({ recipient: user._id, isAnswered: true })
      .sort({ createdAt: -1 }).limit(20);
    res.json(questions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Answer a question
router.put("/:id/answer", protect, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) return res.status(400).json({ message: "Answer required" });
    const q = await QnA.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { answer: answer.trim(), isAnswered: true },
      { new: true }
    );
    if (!q) return res.status(404).json({ message: "Question not found" });
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete a question
router.delete("/:id", protect, async (req, res) => {
  try {
    await QnA.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
