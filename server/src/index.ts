import express from "express";
import cors from "cors";
import router from "./routes";
import { connectToDB } from "./db";

const port = 5000;
const app = express();

// Parse JSON bodies
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // allow Vite frontend
  credentials: true, // if you're using cookies or auth headers
}));

app.use("/api/v1", router);

async function startServer() {
  await connectToDB();
  app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}/api/v1`);
  });
}

startServer();