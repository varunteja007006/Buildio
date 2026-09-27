import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const FORMAT_VERSION = "v1";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret)
    throw new Error("ENCRYPTION_KEY is not configured");
  // Derive a stable 32-byte key from the configured secret.
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    FORMAT_VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptSecret(ciphertext: string): string {
  const [version, iv, tag, data] = ciphertext.split(":");
  if (version !== FORMAT_VERSION || !iv || !tag || !data)
    throw new Error("Invalid encrypted secret format");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
