import "dotenv/config"
import express from "express";
import bodyParser from "body-parser";
import cors from'cors';
import gmailRoutes from "./routes/gmailRoutes.js";
import usersRoutes from'./routes/usersRoutes.js';
import connectDB from './db/db.js';

const app = express();
app.use(bodyParser.json());

connectDB();

app.use(cors({
    origin: ['http://localhost:3000','https://email-massages.onrender.com'],
  }));

// Routes
app.get("/", (req,res)=>{
  res.send("Hi 🤗");
});
app.use("/api/gmail", gmailRoutes);
app.use('/api/users', usersRoutes);

export default app;
