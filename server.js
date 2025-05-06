const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "llama3.2:3b",
      messages: req.body.messages,
      stream: false,
    });

    res.json({
      message: {
        role: "assistant",
        content: response.data.message?.content || response.data.response,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error connecting to Ollama" });
  }
});

app.get("*url", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
