import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.json({ message: "Works fine" });
});

app.listen(5000, () => {
  console.log("Test server running on http://localhost:5000");
});
