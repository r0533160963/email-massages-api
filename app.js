import "dotenv/config"
import express from "express";
import bodyParser from "body-parser";
import cors from'cors';
import gmailRoutes from "./routes/gmailRoutes.js";

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: 'https://email-massages.onrender.com',
  }));

// Routes
app.use("/api/gmail", gmailRoutes);

export default app;
