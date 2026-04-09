import express from "express";
import cors from "cors";
import homesRouter from "./routes/homes";
import readingsRouter from "./routes/readings";
import { requireUser } from "./middleware/auth";

const app = express();
const port = parseInt(process.env.PORT || "4000", 10);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/homes", requireUser, homesRouter);
app.use("/readings", requireUser, readingsRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Optimeter backend listening on port ${port} at 0.0.0.0`);
});