import { encrypt } from "../clientEncryption";
import { decrypt } from "./serverEncryption";

export default async function handler(req, res) {
  const messages = decrypt(req.body.messages);
  const apiKey = process.env.OPENAI_API_KEY;
  const url = process.env.AI_ENDPOINT;
  const body = JSON.stringify({
    messages,
    model: "gpt-3.5-turbo",
    stream: false,
  });
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });
    const data = await response.json();
    res.status(200).json({ res: encrypt(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
