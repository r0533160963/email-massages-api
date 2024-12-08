import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate an OAuth URL
export function generateAuthURL () {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });
};

//button in client
// const scopes = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/gmail.readonly"
// const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=158031050764-e27op69lc9fh0jrdij03nf16n22r6id2.apps.googleusercontent.com&redirect_uri=http://localhost:4000/api/gmail/callback&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/gmail.readonly&include_granted_scopes=true&state=`;
// // Set tokens after receiving authorization code
// exports.setTokens = async (code) => {
//   const { tokens } = await oauth2Client.getToken(code);
//   oauth2Client.setCredentials(tokens);
// };

// List user's emails
export async function listEmails() {

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
  });
  return response.data.messages || [];
};
