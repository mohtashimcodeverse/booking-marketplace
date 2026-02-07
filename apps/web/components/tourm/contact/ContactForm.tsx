"use client";

import { useMemo, useState } from "react";

type FormState = "idle" | "sending" | "sent";
type ContactTopic = "BOOKING" | "OWNERS" | "PARTNERS" | "OTHER";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [topic, setTopic] = useState<ContactTopic>("BOOKING");
  const [message, setMessage] = useState<string>("");

  const canSend = useMemo(() => {
    if (state !== "idle") return false;
    if (name.trim().length < 2) return false;
    if (!email.includes("@")) return false;
    if (message.trim().length < 10) return false;
    return true;
  }, [email, message, name, state]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;

    setState("sending");
    await new Promise((r) => setTimeout(r, 450));
    setState("sent");
  }

  return (
    <section className="relative w-full bg-[var(--tourm-bg)] py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-stone bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-ink/70 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-[#16a6c8]" />
              Message us
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              Send a message
            </h2>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">
              We usually reply as soon as possible. For urgent booking questions, you can also call us.
            </p>

            <div className="mt-6 rounded-2xl border border-stone bg-white/55 p-6 shadow-[0_18px_60px_rgba(2,10,20,0.05)]">
              <p className="text-sm font-extrabold text-midnight">Before you message</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Include dates + number of guests for booking questions",
                  "Include your property location and unit type for owner onboarding",
                  "If you have a booking ID, share it in your message",
                ].map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-ink/80">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#16a6c8]/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone bg-white/55 p-6 shadow-[0_18px_60px_rgba(2,10,20,0.06)] sm:p-8">
            {state === "sent" ? (
              <div className="rounded-2xl border border-stone bg-white p-6">
                <p className="text-lg font-semibold text-midnight">Message sent</p>
                <p className="mt-2 text-sm text-ink/75">
                  Thanks — we’ll get back to you soon. If this is urgent, call{" "}
                  <span className="font-semibold text-midnight">+971502348756</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="mt-6 rounded-2xl border border-stone bg-white px-4 py-3 text-sm font-extrabold text-midnight transition hover:bg-sand"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
                      Name
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-stone bg-white px-4 py-3 text-sm text-midnight placeholder:text-ink/45 outline-none focus:border-[#16a6c8]/40 focus:ring-2 focus:ring-[#16a6c8]/15"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
                      Email
                    </span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-stone bg-white px-4 py-3 text-sm text-midnight placeholder:text-ink/45 outline-none focus:border-[#16a6c8]/40 focus:ring-2 focus:ring-[#16a6c8]/15"
                      placeholder="you@example.com"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
                      Phone
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-stone bg-white px-4 py-3 text-sm text-midnight placeholder:text-ink/45 outline-none focus:border-[#16a6c8]/40 focus:ring-2 focus:ring-[#16a6c8]/15"
                      placeholder="+971..."
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
                      Topic
                    </span>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value as ContactTopic)}
                      className="mt-2 w-full rounded-2xl border border-stone bg-white px-4 py-3 text-sm text-midnight outline-none focus:border-[#16a6c8]/40 focus:ring-2 focus:ring-[#16a6c8]/15"
                    >
                      <option value="BOOKING">Booking</option>
                      <option value="OWNERS">Owners</option>
                      <option value="PARTNERS">Partnership</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
                    Message
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 min-h-[140px] w-full resize-y rounded-2xl border border-stone bg-white px-4 py-3 text-sm text-midnight placeholder:text-ink/45 outline-none focus:border-[#16a6c8]/40 focus:ring-2 focus:ring-[#16a6c8]/15"
                    placeholder="Tell us what you need help with…"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!canSend}
                  className={[
                    "w-full rounded-2xl px-5 py-3 text-sm font-extrabold transition",
                    canSend
                      ? "bg-[#16a6c8] text-white shadow-[0_14px_40px_rgba(22,166,200,0.25)] hover:brightness-95"
                      : "cursor-not-allowed bg-[#16a6c8]/25 text-white/70",
                  ].join(" ")}
                >
                  {state === "sending" ? "Sending..." : "Send message"}
                </button>

                <p className="text-xs text-ink/60">
                  By sending this message, you agree we may contact you regarding your inquiry.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
