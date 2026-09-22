import { promises as fs } from "fs";
import path from "path";

/**
 * No-database lead capture. When DATABASE_URL is not configured, inquiries and
 * newsletter sign-ups are appended to JSONL files under `.data/` so leads are
 * never silently lost in local / demo environments.
 *
 * Writes are best-effort: on read-only filesystems (e.g. some serverless hosts)
 * the failure is logged and swallowed so the user-facing flow still succeeds.
 * For production, configure a database or an email/CRM provider.
 */
const DATA_DIR = path.join(process.cwd(), ".data");

export async function appendLead(
  kind: "inquiry" | "newsletter" | "consultation",
  payload: Record<string, unknown>
): Promise<void> {
  const record = { ...payload, at: new Date().toISOString() };
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(path.join(DATA_DIR, `${kind}.jsonl`), JSON.stringify(record) + "\n", "utf8");
  } catch (err) {
    console.warn(`[leads] could not persist ${kind} lead:`, err);
  }
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
