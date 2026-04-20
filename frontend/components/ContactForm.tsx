"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  SendHorizonal,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  Tag,
} from "lucide-react";

// -------------------------------------------------------------------------- //
//  Types                                                                      //
// -------------------------------------------------------------------------- //
type Status = "idle" | "loading" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

// -------------------------------------------------------------------------- //
//  Validation                                                                 //
// -------------------------------------------------------------------------- //
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Name is required.";
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.message.trim()) errors.message = "Message is required.";
  return errors;
}

// -------------------------------------------------------------------------- //
//  Sub-components                                                              //
// -------------------------------------------------------------------------- //
function FieldWrapper({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground/80"
      >
        <Icon size={14} className="text-primary/70" />
        {label}
        {id !== "subject" && (
          <span className="text-destructive ml-0.5 leading-none">*</span>
        )}
      </Label>
      {children}
      {error && (
        <p className="text-destructive text-xs flex items-center gap-1 animate-fade-in">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------- //
//  ContactForm                                                                 //
// -------------------------------------------------------------------------- //
export default function ContactForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

  // ---------------------------------------------------------------------- //
  //  Handlers                                                                //
  // ---------------------------------------------------------------------- //
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");
    setErrors({});

    try {
      if (!API_URL) {
        throw new Error("API URL not configured. Set NEXT_PUBLIC_API_URL in .env.local.");
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setServerMessage(data.message ?? "Message sent successfully!");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setServerMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again later."
      );
      setStatus("error");
    }
  }

  // ---------------------------------------------------------------------- //
  //  Success State                                                           //
  // ---------------------------------------------------------------------- //
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 animate-fade-up text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Message Sent!
          </h3>
          <p className="text-muted-foreground max-w-sm">{serverMessage}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setStatus("idle");
            setServerMessage("");
          }}
          className="mt-2 border-border/50 hover:border-primary/50 transition-colors"
        >
          Send another message
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------- //
  //  Form                                                                    //
  // ---------------------------------------------------------------------- //
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-label="Contact form"
    >
      {/* Error banner */}
      {status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{serverMessage}</span>
        </div>
      )}

      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper id="name" label="Full Name" icon={User} error={errors.name}>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            disabled={status === "loading"}
            className={`input-glow bg-muted/50 border-border/60 placeholder:text-muted-foreground/50 transition-all ${
              errors.name ? "border-destructive/60" : ""
            }`}
          />
        </FieldWrapper>

        <FieldWrapper id="email" label="Email Address" icon={Mail} error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            disabled={status === "loading"}
            className={`input-glow bg-muted/50 border-border/60 placeholder:text-muted-foreground/50 transition-all ${
              errors.email ? "border-destructive/60" : ""
            }`}
          />
        </FieldWrapper>
      </div>

      {/* Subject */}
      <FieldWrapper id="subject" label="Subject (optional)" icon={Tag}>
        <Input
          id="subject"
          name="subject"
          type="text"
          placeholder="What's this about?"
          value={form.subject}
          onChange={handleChange}
          disabled={status === "loading"}
          className="input-glow bg-muted/50 border-border/60 placeholder:text-muted-foreground/50 transition-all"
        />
      </FieldWrapper>

      {/* Message */}
      <FieldWrapper
        id="message"
        label="Message"
        icon={MessageSquare}
        error={errors.message}
      >
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us how we can help you..."
          rows={6}
          value={form.message}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`input-glow bg-muted/50 border-border/60 placeholder:text-muted-foreground/50 transition-all resize-none ${
            errors.message ? "border-destructive/60" : ""
          }`}
        />
        <p className="text-xs text-muted-foreground/60 text-right">
          {form.message.length} / 5,000
        </p>
      </FieldWrapper>

      {/* Submit */}
      <Button
        id="submit-btn"
        type="submit"
        disabled={status === "loading"}
        className="btn-glow w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <span className="loader" />
            Sending…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <SendHorizonal size={18} />
            Send Message
          </span>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground/60">
        Your message is processed securely via{" "}
        <span className="text-primary/70">AWS Lambda</span> &amp;{" "}
        <span className="text-primary/70">Amazon SES</span>.
      </p>
    </form>
  );
}
