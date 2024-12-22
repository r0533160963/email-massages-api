import express from "express";
import {getAuthURL, handleOAuthCallback, getEmails,getEmailById } from "../controllers/gmailControllers.js";

const router = express.Router();

// Route to initiate OAuth flow
router.get("/auth", getAuthURL);

// Route to handle OAuth callback
router.get("/callback", handleOAuthCallback);

// Route to fetch user's emails
router.get("/emails", getEmails);

router.get("/emails/:id", getEmailById);

export default router;
