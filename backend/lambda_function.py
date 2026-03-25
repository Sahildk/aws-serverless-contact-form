"""
AWS Lambda Contact Form Handler
--------------------------------
Triggered by Amazon API Gateway (HTTP API).
Parses the contact form submission, validates fields,
and sends an email notification via Amazon SES using Boto3.
"""

import json
import os
import re
import logging
import boto3
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --------------------------------------------------------------------------- #
#  Configuration — set via Lambda Environment Variables (SAM template)         #
# --------------------------------------------------------------------------- #
RECIPIENT_EMAIL = os.environ.get("RECIPIENT_EMAIL", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

# --------------------------------------------------------------------------- #
#  CORS Headers                                                                 #
# --------------------------------------------------------------------------- #
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Content-Type": "application/json",
}

# --------------------------------------------------------------------------- #
#  Helpers                                                                      #
# --------------------------------------------------------------------------- #
EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _response(status_code: int, body: dict) -> dict:
    """Build a standard API Gateway proxy response."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


def _validate(data: dict) -> list[str]:
    """Return a list of validation error messages (empty = valid)."""
    errors = []
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name:
        errors.append("Name is required.")
    elif len(name) > 100:
        errors.append("Name must be 100 characters or fewer.")

    if not email:
        errors.append("Email is required.")
    elif not EMAIL_REGEX.match(email):
        errors.append("A valid email address is required.")

    if not message:
        errors.append("Message is required.")
    elif len(message) > 5000:
        errors.append("Message must be 5,000 characters or fewer.")

    return errors


def _build_email_body(data: dict) -> tuple[str, str]:
    """Return (subject, html_body) for the SES email."""
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    subject_field = (data.get("subject") or "No Subject").strip()
    message = data.get("message", "").strip()

    subject = f"[Contact Form] {subject_field}"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: auto;">
        <h2 style="color: #4f46e5;">New Contact Form Submission</h2>
        <table style="width:100%; border-collapse:collapse;">
            <tr>
                <td style="padding:8px; background:#f3f4f6; font-weight:bold; width:120px;">Name</td>
                <td style="padding:8px;">{name}</td>
            </tr>
            <tr>
                <td style="padding:8px; background:#f3f4f6; font-weight:bold;">Email</td>
                <td style="padding:8px;"><a href="mailto:{email}">{email}</a></td>
            </tr>
            <tr>
                <td style="padding:8px; background:#f3f4f6; font-weight:bold;">Subject</td>
                <td style="padding:8px;">{subject_field}</td>
            </tr>
            <tr>
                <td style="padding:8px; background:#f3f4f6; font-weight:bold; vertical-align:top;">Message</td>
                <td style="padding:8px; white-space:pre-wrap;">{message}</td>
            </tr>
        </table>
        <hr style="margin-top:24px; border:none; border-top:1px solid #e5e7eb;" />
        <p style="color:#6b7280; font-size:12px;">
            Sent via AWS Serverless Contact Form &mdash; Lambda + SES
        </p>
    </body>
    </html>
    """
    text_body = (
        f"New Contact Form Submission\n\n"
        f"Name:    {name}\n"
        f"Email:   {email}\n"
        f"Subject: {subject_field}\n\n"
        f"Message:\n{message}"
    )
    return subject, html_body, text_body


def _send_email(data: dict) -> None:
    """Use Boto3 to send the contact email via Amazon SES."""
    ses_client = boto3.client("ses", region_name=AWS_REGION)
    subject, html_body, text_body = _build_email_body(data)

    ses_client.send_email(
        Source=SENDER_EMAIL,
        Destination={"ToAddresses": [RECIPIENT_EMAIL]},
        Message={
            "Subject": {"Data": subject, "Charset": "UTF-8"},
            "Body": {
                "Text": {"Data": text_body, "Charset": "UTF-8"},
                "Html": {"Data": html_body, "Charset": "UTF-8"},
            },
        },
        ReplyToAddresses=[data.get("email", "").strip()],
    )
    logger.info("Email sent successfully to %s", RECIPIENT_EMAIL)


# --------------------------------------------------------------------------- #
#  Lambda Handler                                                               #
# --------------------------------------------------------------------------- #
def lambda_handler(event: dict, context) -> dict:
    """
    Main Lambda entry point.

    Expects an HTTP API Gateway v2 proxy event.
    Accepts:
        POST /contact  — { name, email, subject?, message }
        OPTIONS /contact — CORS preflight
    """
    logger.info("Received event: %s", json.dumps(event))

    # Handle CORS preflight
    http_method = (
        event.get("requestContext", {}).get("http", {}).get("method", "")
        or event.get("httpMethod", "")
    ).upper()

    if http_method == "OPTIONS":
        return _response(200, {"message": "CORS preflight OK"})

    if http_method != "POST":
        return _response(405, {"error": "Method not allowed. Use POST."})

    # Parse JSON body
    try:
        raw_body = event.get("body") or "{}"
        # API Gateway may base64-encode the body
        if event.get("isBase64Encoded", False):
            import base64
            raw_body = base64.b64decode(raw_body).decode("utf-8")
        data = json.loads(raw_body)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Failed to parse JSON body: %s", exc)
        return _response(400, {"error": "Invalid JSON in request body."})

    # Validate
    errors = _validate(data)
    if errors:
        return _response(400, {"error": "Validation failed.", "details": errors})

    # Check configuration
    if not RECIPIENT_EMAIL or not SENDER_EMAIL:
        logger.error("Missing SES email configuration in environment variables.")
        return _response(500, {"error": "Server configuration error. Please contact the administrator."})

    # Send email via SES
    try:
        _send_email(data)
    except ClientError as exc:
        error_code = exc.response["Error"]["Code"]
        logger.error("SES ClientError [%s]: %s", error_code, exc)
        if error_code in ("MessageRejected", "MailFromDomainNotVerified"):
            return _response(502, {"error": "Email delivery failed. Please verify sender/recipient in SES."})
        return _response(502, {"error": "Failed to send email. Please try again later."})
    except Exception as exc:
        logger.error("Unexpected error: %s", exc)
        return _response(500, {"error": "An unexpected server error occurred."})

    return _response(200, {
        "message": "Thank you! Your message has been sent. We'll be in touch shortly.",
    })
