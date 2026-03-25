"""
Local unit test for lambda_function.py
---------------------------------------
Run with:  python test_lambda.py

Uses unittest.mock to patch boto3 so no real AWS calls are made.
Tests cover: valid submission, missing fields, invalid email, OPTIONS preflight.
"""

import json
import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# --- Set environment variables BEFORE importing the lambda ---
os.environ.setdefault("RECIPIENT_EMAIL", "recipient@example.com")
os.environ.setdefault("SENDER_EMAIL", "sender@example.com")
os.environ.setdefault("AWS_REGION", "us-east-1")

# Ensure we import from the same directory
sys.path.insert(0, os.path.dirname(__file__))
import lambda_function  # noqa: E402


def make_event(body: dict | None, method: str = "POST", base64: bool = False) -> dict:
    """Helper to build a minimal API Gateway HTTP API v2 proxy event."""
    raw = json.dumps(body) if body is not None else ""
    return {
        "requestContext": {"http": {"method": method}},
        "body": raw,
        "isBase64Encoded": base64,
    }


class TestLambdaHandler(unittest.TestCase):

    # ------------------------------------------------------------------ #
    #  Valid submission                                                     #
    # ------------------------------------------------------------------ #
    @patch("lambda_function.boto3")
    def test_valid_submission(self, mock_boto3):
        """A fully valid POST should return 200 and call SES send_email."""
        mock_ses = MagicMock()
        mock_boto3.client.return_value = mock_ses

        event = make_event({
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Hello!",
            "message": "This is a test message from the contact form.",
        })
        result = lambda_function.lambda_handler(event, None)

        self.assertEqual(result["statusCode"], 200, f"Expected 200, got {result}")
        mock_ses.send_email.assert_called_once()
        body = json.loads(result["body"])
        self.assertIn("message", body)
        print("✅  PASS — valid submission → 200 OK")

    # ------------------------------------------------------------------ #
    #  Missing required fields                                             #
    # ------------------------------------------------------------------ #
    @patch("lambda_function.boto3")
    def test_missing_name(self, mock_boto3):
        event = make_event({"email": "jane@example.com", "message": "Hi"})
        result = lambda_function.lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 400)
        body = json.loads(result["body"])
        self.assertIn("details", body)
        print("✅  PASS — missing name → 400")

    @patch("lambda_function.boto3")
    def test_missing_email_and_message(self, mock_boto3):
        event = make_event({"name": "Jane"})
        result = lambda_function.lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 400)
        body = json.loads(result["body"])
        # Should report both email and message errors
        self.assertGreaterEqual(len(body.get("details", [])), 2)
        print("✅  PASS — missing email + message → 400 with 2+ errors")

    # ------------------------------------------------------------------ #
    #  Invalid email format                                                #
    # ------------------------------------------------------------------ #
    @patch("lambda_function.boto3")
    def test_invalid_email_format(self, mock_boto3):
        event = make_event({
            "name": "Jane",
            "email": "not-an-email",
            "message": "Hello world",
        })
        result = lambda_function.lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 400)
        print("✅  PASS — invalid email format → 400")

    # ------------------------------------------------------------------ #
    #  Empty JSON body                                                     #
    # ------------------------------------------------------------------ #
    @patch("lambda_function.boto3")
    def test_empty_body(self, mock_boto3):
        event = make_event({})
        result = lambda_function.lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 400)
        print("✅  PASS — empty body → 400")

    # ------------------------------------------------------------------ #
    #  CORS preflight (OPTIONS)                                            #
    # ------------------------------------------------------------------ #
    def test_options_preflight(self):
        event = make_event(None, method="OPTIONS")
        result = lambda_function.lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 200)
        self.assertIn("Access-Control-Allow-Origin", result["headers"])
        print("✅  PASS — OPTIONS preflight → 200")

    # ------------------------------------------------------------------ #
    #  Wrong HTTP method                                                   #
    # ------------------------------------------------------------------ #
    def test_get_method_rejected(self):
        event = make_event(None, method="GET")
        result = lambda_function.lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 405)
        print("✅  PASS — GET method → 405")

    # ------------------------------------------------------------------ #
    #  Malformed JSON body                                                 #
    # ------------------------------------------------------------------ #
    def test_malformed_json(self):
        event = {
            "requestContext": {"http": {"method": "POST"}},
            "body": "{ this is not json }",
            "isBase64Encoded": False,
        }
        result = lambda_function.lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 400)
        print("✅  PASS — malformed JSON → 400")


if __name__ == "__main__":
    print("\n🧪  Running Lambda unit tests (no real AWS calls)...\n")
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestLambdaHandler)
    runner = unittest.TextTestRunner(verbosity=0)
    result = runner.run(suite)
    print()
    if result.wasSuccessful():
        print("🎉  All tests passed!")
    else:
        print("❌  Some tests failed.")
        sys.exit(1)
