import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

export type ContactSubmissionTopic = "BOOKING" | "OWNERS" | "PARTNERS" | "OTHER";

export async function createContactSubmission(input: {
  name: string;
  email: string;
  phone?: string;
  topic: ContactSubmissionTopic;
  message: string;
}): Promise<{ id: string; status: string; createdAt: string }> {
  const res = await apiFetch<{ id: string; status: string; createdAt: string }>(
    "/contact-submissions",
    {
      method: "POST",
      cache: "no-store",
      auth: "none",
      body: {
        name: input.name,
        email: input.email,
        phone: input.phone?.trim() || undefined,
        topic: input.topic,
        message: input.message,
      },
    }
  );
  return unwrap(res);
}
