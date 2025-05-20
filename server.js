const express = require("express");
const axios = require("axios");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chats");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/ollamaChat")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/ollamaChat",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  }),
);

// Authentication routes
app.use("/api/auth", authRoutes);

// Chat history routes
app.use("/api/chats", chatRoutes);

app.post("/api/chat", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "llama3.2:3b",
      messages: req.body.messages,
      stream: false,
    });

    const aiMessage = {
      role: "assistant",
      content: response.data.message?.content || response.data.response,
    };

    // If user is authenticated and chatId is provided, add the message to chat history
    if (req.session.userId && req.body.chatId) {
      const Chat = require("./models/Chat");
      const chat = await Chat.findOne({
        _id: req.body.chatId,
        userId: req.session.userId,
      });

      if (chat) {
        chat.messages.push(aiMessage);
        chat.updatedAt = Date.now();
        await chat.save();
      }
    }

    res.json({ message: aiMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error connecting to Ollama" });
  }
});

app.get("/*url", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
