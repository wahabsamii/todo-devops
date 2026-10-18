import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import todoRoutes from "./routes/todoRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Todo API is running" });
});

app.use("/api/todos", todoRoutes);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
};

startServer();