import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sniffImageType } from "@/lib/image-sniff";
import { ok, fail } from "@/lib/api";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`upload:${session.sub}:${ip}`, 60, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Invalid upload.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file provided.");
  if (file.size > MAX_BYTES) return fail("Image must be 8MB or smaller.");

  const buf = Buffer.from(await file.arrayBuffer());
  const detected = sniffImageType(buf);
  if (!detected) {
    return fail("File is not a supported image (JPEG, PNG, WebP, or AVIF).");
  }

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected}`;
  const dir = path.join(process.cwd(), "public", "uploads");

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
  } catch (err) {
    console.error("[upload]", err);
    return fail("Could not save the file.", 500);
  }

  return ok({ url: `/uploads/${name}` }, { status: 201 });
}
