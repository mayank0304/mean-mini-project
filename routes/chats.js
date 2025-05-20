const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

// Get all chats for the current user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.session.userId })
      .select("_id title updatedAt")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get chats" });
  }
});

// Get a specific chat by ID
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Failed to get chat" });
  }
});

// Create a new chat
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { title, messages } = req.body;

    const chat = new Chat({
      userId: req.session.userId,
      title: title || undefined,
      messages: messages || [],
    });

    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Failed to create chat" });
  }
});

// Update a chat (add messages)
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { messages, title } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (messages && Array.isArray(messages)) {
      chat.messages = messages;
    }
    if (title) {
      chat.title = title;
    }

    chat.updatedAt = Date.now();
    await chat.save();

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Failed to update chat" });
  }
});

// Delete a chat
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const result = await Chat.deleteOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

module.exports = router;
