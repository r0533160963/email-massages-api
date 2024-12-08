// import axios from "axios";
// import {generateAuthURL, listEmails} from "../services/gmailService.js";



// export function getAuthURL (req, res) {
//   const authURL = generateAuthURL();
//   res.redirect(authURL);
// };

// export async function handleOAuthCallback (req, res) {
//   try {
//     const { code } = req.query;
//     console.log('code', code)
//     const tokenResult = await axios.post(`https://oauth2.googleapis.com/token`, {
//       code,
//       client_id: process.env.CLIENT_ID,
//       client_secret: process.env.CLIENT_SECRET,
//       redirect_uri: process.env.REDIRECT_URI,
//       grant_type: "authorization_code",
//     });
//     //TODO send tokenResult to client
//     //const googleProfile = JSON.parse(decodeURIComponent(escape(atob(tokenResult.data.id_token.split(".")[1]))));
//     console.log('token', tokenResult.data)

//     // Use the access token to fetch email messages
//     const accessToken = tokenResult.data.access_token;

//     res.send(tokenResult.data.access_token)
//   } catch (error) {
//     console.error("Error during OAuth callback:", error);
//     res.status(500).send("Authentication failed.");
//   }
// };

// export async function getEmails (req, res) {
//     const accessToken = req.headers.authorization.slice(7)

//   try {
//     //TODO להעביר לפונקציה נפרדת של שליפת מיילים
// const specificEmail = "malka2039@gmail.com"
// //שליפת הודעות עם מידע בסיסי של מזהה בלבד
//     const messagesResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${specificEmail}`, {
//     headers: {
//         Authorization: `Bearer ${accessToken}`,
//     },
//     });

    
// // Retrieve details of each message
// const messages = messagesResponse.data.messages || [];
// const messageDetailsPromises = messages.map(async (message) => {
//   const messageResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });
  
//   const headers = messageResponse.data.payload.headers;
//   const subjectHeader = headers.find(header => header.name === 'Subject');
//   const dateHeader = headers.find(header => header.name === 'Date');

//   return {
//     id: message.id,
//     subject: subjectHeader ? subjectHeader.value : 'No Subject',
//     date: dateHeader ? dateHeader.value : 'No Date',
//     content: messageResponse.data.payload.parts ? messageResponse.data.payload.parts[0].body.data : 'No Content',
//   };
// });

// const detailedMessages = await Promise.all(messageDetailsPromises);
// console.log('detailedMessages', detailedMessages);

// res.send(detailedMessages)
//   } catch (error) {
//     console.error("Error fetching emails:", error);
//     res.status(500).send("Failed to fetch emails.");
//   }
// };


import axios from "axios";
import { generateAuthURL } from "../services/gmailService.js";

export function getAuthURL(req, res) {
  const authURL = generateAuthURL();
  res.redirect(authURL);
}

export async function handleOAuthCallback(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Authorization code is missing.");
    }

    const tokenResult = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const accessToken = tokenResult.data.access_token;

    res.send({ accessToken });
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).send("Authentication failed.");
  }
}

export async function getEmails(req, res) {
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  if (!accessToken) {
    return res.status(401).send("Access token is missing.");
  }

  try {
    const specificEmail = "malka2039@gmail.com";

    // Fetching basic email details
    const messagesResponse = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${specificEmail}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const messages = messagesResponse.data.messages || [];

    const messageDetailsPromises = messages.map(async (message) => {
      const messageResponse = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const headers = messageResponse.data.payload.headers;

      const subjectHeader = headers.find((header) => header.name === "Subject");
      const dateHeader = headers.find((header) => header.name === "Date");
      const fromHeader = headers.find((header) => header.name === "From");

      const bodyPart =
        messageResponse.data.payload.parts?.find(
          (part) => part.mimeType === "text/plain"
        ) || messageResponse.data.payload.parts?.[0];

      const emailSender = fromHeader ? fromHeader.value.match(/<(.*?)>/)?.[1] : "";
      const senderName = fromHeader
        ? fromHeader.value.replace(/<(.*?)>/, "").trim()
        : "Unknown";

      return {
        id: message.id,
        emailSender: emailSender || "Unknown",
        senderName: senderName || "Unknown",
        subject: subjectHeader?.value || "No Subject",
        body: bodyPart?.body?.data
          ? Buffer.from(bodyPart.body.data, "base64").toString("utf-8")
          : "No Content",
        date: dateHeader?.value || "No Date",
      };
    });

    const detailedMessages = await Promise.all(messageDetailsPromises);

    res.send(detailedMessages);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).send("Failed to fetch emails.");
  }
}
