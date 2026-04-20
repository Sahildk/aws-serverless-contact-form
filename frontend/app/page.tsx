import ContactForm from "@/components/ContactForm";
import {
  Cloud,
  Zap,
  Shield,
  Globe,
  ExternalLink,
  ArrowRight,
  ServerCrash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ── Tech Badge ──────────────────────────────────────────────────────────── //
function TechBadge({ label }: { label: string }) {
  return (
    <Badge
      variant="secondary"
      className="text-xs font-mono border border-border/40 bg-muted/40 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-default"
    >
      {label}
    </Badge>
  );
}

// ── Feature Card ─────────────────────────────────────────────────────────── //
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: string;
}) {
  return (
    <div
      className={`glass-card rounded-xl p-5 flex gap-4 animate-fade-up ${delay ?? ""}`}
    >
      <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────── //
export default function HomePage() {
  return (
    <main className="gradient-bg min-h-screen flex flex-col">
      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/30 backdrop-blur-xl bg-background/30">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <ServerCrash size={16} className="text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              Serverless<span className="text-primary">Form</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TechBadge label="AWS Lambda" />
            <TechBadge label="Next.js 15" />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs text-primary/80 mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Fully Serverless · Zero Servers · Pay-Per-Use
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-4 animate-fade-up">
          AWS Serverless{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Contact Form
          </span>
        </h1>

        <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed animate-fade-up animate-delay-100">
          A production-grade contact form powered by{" "}
          <strong className="text-foreground/80">Next.js</strong>,{" "}
          <strong className="text-foreground/80">AWS Lambda</strong>,{" "}
          <strong className="text-foreground/80">API Gateway</strong>, and{" "}
          <strong className="text-foreground/80">Amazon SES</strong>. No servers
          to manage — just submit and receive.
        </p>

        {/* Architecture flow pill */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-muted-foreground animate-fade-up animate-delay-200">
          {["Browser", "API Gateway", "Lambda (Python)", "Amazon SES", "Inbox"].map(
            (step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-md border border-border/40 bg-muted/30 px-2.5 py-1">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <ArrowRight size={12} className="text-primary/50" />
                )}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Left — Feature highlights */}
          <aside className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-5">
              Why Serverless?
            </h2>

            <FeatureCard
              icon={Zap}
              title="Instant Scale"
              description="Lambda auto-scales from 0 to thousands of concurrent executions. No provisioning needed."
              delay="animate-delay-100"
            />
            <FeatureCard
              icon={Cloud}
              title="Managed Infrastructure"
              description="API Gateway, Lambda, and SES are fully managed. Focus on code, not servers."
              delay="animate-delay-200"
            />
            <FeatureCard
              icon={Shield}
              title="Least-Privilege IAM"
              description="The Lambda function only has ses:SendEmail permission — no over-provisioned roles."
              delay="animate-delay-300"
            />
            <FeatureCard
              icon={Globe}
              title="Global Edge"
              description="API Gateway is deployed close to your users on the AWS global infrastructure."
              delay="animate-delay-400"
            />

            {/* Stack tags */}
            <div className="pt-2 animate-fade-up animate-delay-500">
              <p className="text-xs text-muted-foreground/60 mb-3">Stack</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Next.js 15",
                  "TypeScript",
                  "Tailwind CSS v4",
                  "shadcn/ui",
                  "Python 3.12",
                  "Boto3",
                  "AWS SAM",
                  "Amazon SES",
                ].map((t) => (
                  <TechBadge key={t} label={t} />
                ))}
              </div>
            </div>
          </aside>

          {/* Right — Contact form */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-up animate-delay-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Get in Touch
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill out the form and we&apos;ll get back to you within 24 hours.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/20 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/60">
          <span>
            Built with{" "}
            <span className="text-primary/70">Next.js</span> +{" "}
            <span className="text-primary/70">AWS Serverless</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Lambda · API Gateway · SES
          </span>
        </div>
      </footer>
    </main>
  );
}
