import { Hono } from "hono";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAuth } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";
import type { ApiResponse } from "../lib/types.js";
import { randomUUID } from "crypto";

type AuthEnv = {
  Variables: {
    authUser: { dbUserId: string; email: string };
  };
};

const app = new Hono<AuthEnv>();

function getR2Client() {
  const accountId = process.env["CLOUDFLARE_R2_ACCOUNT_ID"];
  const accessKeyId = process.env["CLOUDFLARE_R2_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["CLOUDFLARE_R2_SECRET_ACCESS_KEY"];

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 credentials are not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

// POST /api/upload/checkin-photo
// Accepts multipart form data with a "photo" field
// Uploads directly to R2 and returns the public URL
app.post("/checkin-photo", requireAuth, async (c) => {
  const bucketName = process.env["CLOUDFLARE_R2_BUCKET_NAME"] ?? "pulse-checkins";
  const accountId = process.env["CLOUDFLARE_R2_ACCOUNT_ID"];

  let r2: S3Client;
  try {
    r2 = getR2Client();
  } catch (err) {
    logger.error({ err }, "R2 client init failed");
    return c.json<ApiResponse<never>>(
      { success: false, error: "Photo upload unavailable" },
      503
    );
  }

  const formData = await c.req.formData();
  const photo = formData.get("photo");

  if (!photo || typeof photo === "string") {
    return c.json<ApiResponse<never>>(
      { success: false, error: "photo field is required" },
      400
    );
  }

  const file = photo as File;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "Only JPEG, PNG, and WebP images are allowed" },
      400
    );
  }

  // 10 MB limit
  if (file.size > 10 * 1024 * 1024) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "Photo must be under 10 MB" },
      400
    );
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `checkins/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000",
      })
    );
  } catch (err) {
    logger.error({ err, key }, "R2 upload failed");
    return c.json<ApiResponse<never>>(
      { success: false, error: "Photo upload failed" },
      500
    );
  }

  // Construct the public URL (assumes R2 bucket has public access enabled)
  const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;

  return c.json<ApiResponse<{ url: string }>>({
    success: true,
    data: { url: publicUrl },
  });
});

// POST /api/upload/presign — get a presigned URL for direct browser upload
app.post("/presign", requireAuth, async (c) => {
  const bucketName = process.env["CLOUDFLARE_R2_BUCKET_NAME"] ?? "pulse-checkins";
  const accountId = process.env["CLOUDFLARE_R2_ACCOUNT_ID"];

  let r2: S3Client;
  try {
    r2 = getR2Client();
  } catch (err) {
    logger.error({ err }, "R2 client init failed");
    return c.json<ApiResponse<never>>(
      { success: false, error: "Upload unavailable" },
      503
    );
  }

  const key = `checkins/${randomUUID()}.jpg`;

  const presignedUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: "image/jpeg",
    }),
    { expiresIn: 300 } // 5 minutes
  );

  const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;

  return c.json<ApiResponse<{ uploadUrl: string; publicUrl: string }>>({
    success: true,
    data: { uploadUrl: presignedUrl, publicUrl },
  });
});

export default app;
