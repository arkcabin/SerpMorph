import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Basic encryption utility using AES-256-CBC.
 * Follows security best practices by using an Initialization Vector (IV)
 * and deriving a secure key from the environment secret.
 */

const ALGORITHM = "aes-256-cbc";
const SECRET = process.env.BETTER_AUTH_SECRET || "fallback_secret_keep_it_secure";
// Derive a 32-byte key from the secret
const KEY = scryptSync(SECRET, "serp-morph-salt", 32);

export function encrypt(text: string): string {
	if (!text) return "";
	const iv = randomBytes(16);
	const cipher = createCipheriv(ALGORITHM, KEY, iv);
	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");
	// Return IV and encrypted text joined by a colon
	return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
	if (!text) return "";
	
	// Basic check to see if it's in our IV:Encrypted format
	if (!text.includes(":")) return text; 

	try {
		const [ivHex, encryptedText] = text.split(":");
		const iv = Buffer.from(ivHex, "hex");
		const decipher = createDecipheriv(ALGORITHM, KEY, iv);
		let decrypted = decipher.update(encryptedText, "hex", "utf8");
		decrypted += decipher.final("utf8");
		return decrypted;
	} catch (error) {
		console.error("Decryption failed:", error);
		return text; // Fallback to original text if decryption fails
	}
}
