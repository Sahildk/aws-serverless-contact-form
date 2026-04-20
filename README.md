# ☁️ AWS Serverless Contact Form

> A production-grade, fully serverless contact form that bridges **modern web development** with **AWS Cloud Services**. Users submit a form → API Gateway receives it → Lambda processes it → SES delivers the email — all without a single server to manage.

![AWS](https://img.shields.io/badge/AWS-Serverless-FF9900?logo=amazon-aws&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22C55E)

---

## ✨ Features

- 🎨 **Premium Dark UI** — Glassmorphism cards, gradient backgrounds, smooth animations, and Inter font
- ✅ **Dual Validation** — Client-side (instant) + server-side (Lambda) form validation
- ⚡ **Fully Serverless** — Zero infrastructure management, auto-scaling, pay-per-use pricing
- 🔐 **Least-Privilege Security** — IAM role grants only `ses:SendEmail` permission
- 📧 **Rich Emails** — Both HTML and plain-text email bodies via Amazon SES
- 🏗️ **Infrastructure-as-Code** — Entire AWS stack defined in a single SAM `template.yaml`
- 🧪 **Tested** — 8 automated unit tests with 100% pass rate (no AWS account needed)
- 📱 **Responsive** — Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

```
┌──────────┐     POST /contact      ┌──────────────┐     Invoke      ┌────────────────┐     send_email()    ┌───────────┐
│          │ ──────────────────────→ │              │ ──────────────→ │                │ ─────────────────→ │           │
│  Browser │                        │ API Gateway  │                 │  AWS Lambda    │                    │    SES    │ → 📧 Inbox
│ (Next.js)│ ←────────────────────  │  (HTTP API)  │ ←────────────── │ (Python/Boto3) │ ←───────────────── │           │
│          │      JSON Response     │              │    Response     │                │    Confirmation    │           │
└──────────┘                        └──────────────┘                 └────────────────┘                    └───────────┘
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui | Responsive form UI with validation |
| **API Layer** | Amazon API Gateway (HTTP API) | Receives POST, handles CORS, triggers Lambda |
| **Backend** | AWS Lambda (Python 3.12) | Validates input, orchestrates email dispatch |
| **AWS SDK** | Boto3 (Official AWS SDK for Python) | Interfaces with Amazon SES |
| **Email** | Amazon Simple Email Service (SES) | Delivers formatted HTML emails |
| **IaC** | AWS SAM (CloudFormation) | Defines all infrastructure in one YAML file |

---

## 📁 Project Structure

```
aws-serverless-contact-form/
│
├── backend/                          # Python Lambda backend
│   ├── lambda_function.py            # Core handler — validation + SES email
│   ├── test_lambda.py                # 8 unit tests (mocked, no AWS needed)
│   ├── requirements.txt              # Python dependencies (boto3)
│   └── .env.example                  # Environment variable template
│
├── infrastructure/                   # AWS SAM deployment
│   ├── template.yaml                 # CloudFormation — Lambda, API GW, IAM
│   └── samconfig.toml                # SAM deployment configuration
│
├── frontend/                         # Next.js 16 + Tailwind v4
│   ├── app/
│   │   ├── layout.tsx                # Root layout (Inter font, dark mode)
│   │   ├── page.tsx                  # Hero landing page + feature cards
│   │   └── globals.css               # Premium dark theme + animations
│   ├── components/
│   │   ├── ContactForm.tsx           # Form with validation + states
│   │   └── ui/                       # shadcn/ui primitives (Button, Input, etc.)
│   ├── .env.local.example            # API URL template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔧 Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Python | 3.12+ | [python.org](https://python.org) |
| AWS CLI | v2 | [Install Guide](https://aws.amazon.com/cli/) |
| AWS SAM CLI | Latest | [Install Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) |
| AWS Account | — | [aws.amazon.com](https://aws.amazon.com) |

---

## 🚀 Quick Start

### Step 1 — Verify Emails in Amazon SES

Before any emails can be sent, you must verify your email addresses in SES:

1. Go to **AWS Console → SES → Verified Identities**
2. Click **Create Identity** → choose **Email address**
3. Verify **both** your sender email and recipient email
4. Check your inbox and click the verification link from AWS

> ⚠️ **SES Sandbox:** While in sandbox mode, both sender and recipient emails must be verified.

---

### Step 2 — Configure AWS CLI

```bash
aws configure
```

Enter your IAM credentials:
```
AWS Access Key ID:     <your-key>
AWS Secret Access Key: <your-secret>
Default region:        us-east-1
Default output format: json
```

---

### Step 3 — Deploy the Backend (AWS SAM)

```bash
cd infrastructure

# Build the Lambda package
sam build

# Deploy interactively
sam deploy --guided
```

When prompted, provide:
| Prompt | Value |
|---|---|
| Stack Name | `aws-serverless-contact-form` |
| AWS Region | `us-east-1` |
| RecipientEmail | Your SES-verified email |
| SenderEmail | Your SES-verified email |
| Environment | `prod` |

After deployment, copy the **ApiEndpoint** URL from the output:
```
ApiEndpoint: https://abc123.execute-api.us-east-1.amazonaws.com/prod/contact
```

---

### Step 4 — Configure & Run the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

Edit `.env.local` and paste the API Gateway URL:
```env
NEXT_PUBLIC_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod/contact
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — fill out the form and submit!

---

## 🧪 Running Unit Tests

Run all 8 backend tests locally — no AWS account required:

```bash
cd backend
pip install -r requirements.txt
python test_lambda.py
```

Expected output:
```
🧪  Running Lambda unit tests (no real AWS calls)...

✅  PASS — valid submission → 200 OK
✅  PASS — missing name → 400
✅  PASS — missing email + message → 400 with 2+ errors
✅  PASS — invalid email format → 400
✅  PASS — empty body → 400
✅  PASS — OPTIONS preflight → 200
✅  PASS — GET method → 405
✅  PASS — malformed JSON → 400

🎉  All tests passed!
```

---

## ⚙️ Environment Variables

### Backend (Lambda — set via SAM `template.yaml`)

| Variable | Description |
|---|---|
| `RECIPIENT_EMAIL` | SES-verified email to receive form submissions |
| `SENDER_EMAIL` | SES-verified email used as the sender (From:) |
| `AWS_REGION` | AWS region where SES is configured (default: `us-east-1`) |

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full API Gateway endpoint URL (from `sam deploy` output) |

---

## 🔐 Security

The Lambda execution role follows the **principle of least privilege**:

```yaml
Permissions granted:
  ✅ ses:SendEmail        # Send formatted emails
  ✅ ses:SendRawEmail     # Send raw emails (fallback)
  ✅ CloudWatch Logs      # Write execution logs

Permissions NOT granted:
  ❌ S3, DynamoDB, EC2, or any other service
```

CORS is configured on API Gateway to allow only `POST` and `OPTIONS` methods.

---

## 🔄 Updating the Backend

After modifying `lambda_function.py`:

```bash
cd infrastructure
sam build
sam deploy
```

SAM automatically updates only the changed resources.

---

## 💰 Cost

This project runs within the **AWS Free Tier** for most use cases:

| Service | Free Tier |
|---|---|
| Lambda | 1M requests/month free |
| API Gateway | 1M calls/month free (first 12 months) |
| SES | 62,000 emails/month free (from EC2) or $0.10/1000 emails |
| CloudWatch | 5 GB log storage free |

> For a typical contact form (a few hundred submissions/month), the cost is effectively **$0**.

---

## 📜 License

MIT © 2026
