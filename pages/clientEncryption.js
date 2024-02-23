const crypto = require("crypto");

const secretKey = Buffer.from(
  "f2e2b89277a08f92797138c5ae7cf9a7b9353fe31489929f187b8fce4b8b4af6",
  "hex"
);
const algorithm = "aes-256-cbc";
const ivLength = 16;

// Encrypt function for both text and objects
const encrypt = (data) => {
  const text = typeof data === "object" ? JSON.stringify(data) : data;
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

// Decrypt function for both text and objects
const decrypt = (encryptedText) => {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encrypted = textParts.join(":");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  try {
    return JSON.parse(decrypted);
  } catch (e) {
    return decrypted; // Return as plain text if not JSON
  }
};

module.exports = { encrypt, decrypt };
