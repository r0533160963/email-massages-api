import express from "express";
import {getAuthURL, handleOAuthCallback, getEmails } from "../controllers/gmailControllers.js";

const router = express.Router();

// Route to initiate OAuth flow
router.get("/auth", getAuthURL);

// Route to handle OAuth callback
router.get("/callback", handleOAuthCallback);

// Route to fetch user's emails
router.get("/emails", getEmails);

export default router;
