import express from "express";
import cors from "cors";
import router from "./routes";
import { connectToDB } from "./db";

const port = process.env.PORT || 3001;
const app = express();

// Parse JSON bodies
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"], // allow Vite frontend and other common dev ports
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