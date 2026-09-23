import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

const REGION = process.env.S3_REGION ?? "auto";
const ENDPOINT = process.env.S3_ENDPOINT ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE = (process.env.S3_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

const client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: true,
});

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
};

export function extensionFor(contentType: string): string | null {
  return EXT_BY_TYPE[contentType] ?? null;
}

export async function presignedLogoUpload(
  agencyId: string,
  contentType: string,
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const ext = extensionFor(contentType) as string;
  const key = `logos/${agencyId}/${crypto.randomUUID()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );
  return { uploadUrl, key, publicUrl: `${PUBLIC_BASE}/${key}` };
}
