const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// API routes
app.use("/auth", require("./routes/jwtAuth"));
app.use("/favourite", require("./routes/favourite"));
app.use("/dashboard", require("./routes/dashboard"));

// Serve React app (assuming React is in client/build)
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
