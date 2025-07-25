import express from "express";
import cors from "cors";
import router from "./routes";
import { connectToDB } from "./db";

const port = process.env.PORT || 3001;
const app = express();

// Parse JSON bodies
app.use(express.json());

// CORS is now handled in routes.ts with environment variables

app.use("/api/v1", router);

async function startServer() {
  await connectToDB();
  app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}/api/v1`);
  });
}

startServer();
