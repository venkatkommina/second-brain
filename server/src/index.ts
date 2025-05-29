import express from "express";
import router from "./routes";
import { connectToDB } from "./db";
import cors from "cors";

const port = 5000;
const app = express();

app.use(cors());
app.use("/api/v1", router);

async function startServer() {
  await connectToDB();
  app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}/api/v1`);
  });
}

startServer();