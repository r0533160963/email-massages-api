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

    const html = `
    <script>
      window.opener.postMessage({ accessToken: "${accessToken}" }, "*");
      window.close();
    </script>
  `;
  res.send(html);

  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).send("Authentication failed.");
  }
}

// async function getProfilePicture(accessToken) {
//   try {
//     const response = await axios.get(
//       `https://people.googleapis.com/v1/people/me?personFields=photos`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     const photoUrl = response.data.photos?.[0]?.url;

//     if (photoUrl) {
//       console.log("Profile photo URL:", photoUrl);
//       return photoUrl;
//     } else {
//       console.warn("No profile picture found.");
//       return null;
//     }
//   } catch (error) {
//     if (error.response) {
//       console.error(
//         `Error fetching profile picture: ${error.response.status} - ${error.response.data.error.message}`
//       );
//     } else {
//       console.error("Error fetching profile picture:", error.message);
//     }
//     return null;
//   }
// }

export async function getEmails(req, res) {
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  if (!accessToken) {
    return res.status(401).send("Access token is missing.");
  }

  try {
    const specificEmails = ["malka2039@gmail.com", "noreply@github.com"];
    let allMessages = [];

    // מבצע חיפוש על כל כתובת בנפרד
    for (const email of specificEmails) {
      const emailQuery = `from:${email}`;

      let nextPageToken = null;
      do {
        const messagesResponse = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${emailQuery}&pageToken=${nextPageToken || ''}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        allMessages = allMessages.concat(messagesResponse.data.messages); // מאחד את התוצאות
        nextPageToken = messagesResponse.data.nextPageToken; // אם יש דף נוסף
      } while (nextPageToken);
    }

    const messageDetailsPromises = allMessages.map(async (message) => {
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
          (part) => part.mimeType === "text/html"
        ) || messageResponse.data.payload.parts?.[0];

      const emailSender = fromHeader ? fromHeader.value.match(/<(.*?)>/)?.[1] : "";
      const senderName = fromHeader
        ? fromHeader.value.replace(/<(.*?)>/, "").trim()
        : "Unknown";

      // const profilePicture = await getProfilePicture(emailSender, accessToken);

      return {
        id: message.id,
        emailSender: emailSender || "Unknown",
        senderName: senderName || "Unknown",
        profilePicture: profilePicture || "/default-avatar.png",
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

export async function getEmailById(req, res) {
  const accessToken = req.headers.authorization?.split("Bearer ")[1];
  const emailId = req.params.id; // מזהה המייל מהנתיב

  if (!accessToken) {
    return res.status(401).send("Access token is missing.");
  }

  if (!emailId) {
    return res.status(400).send("Email ID is missing.");
  }

  try {
    const messageResponse = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`,
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
        (part) => part.mimeType === "text/html"
      ) || messageResponse.data.payload.parts?.[0];

    const decodedBody = bodyPart?.body?.data
      ? Buffer.from(bodyPart.body.data, "base64").toString("utf-8")
      : "No Content";

    const emailSender = fromHeader ? fromHeader.value.match(/<(.*?)>/)?.[1] : "";
    const senderName = fromHeader
      ? fromHeader.value.replace(/<(.*?)>/, "").trim()
      : "Unknown";

    // const profilePicture = await getProfilePicture(emailSender, accessToken);

    const email = {
      id: emailId,
      emailSender: emailSender || "Unknown",
      senderName: senderName || "Unknown",
      profilePicture: profilePicture || "/default-avatar.png",
      subject: subjectHeader?.value || "No Subject",
      body: decodedBody,
      date: dateHeader?.value || "No Date",
    };

    res.send(email);
  } catch (error) {
    console.error("Error fetching email by ID:", error);
    res.status(500).send("Failed to fetch email.");
  }
}
