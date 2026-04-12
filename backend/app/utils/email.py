import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)

def send_email(to_email: str, subject: str, body_html: str, body_text: str = "") -> bool:
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[EMAIL] SMTP not configured. Would send to {to_email}: {subject}")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Architecture Studio <{SMTP_FROM}>"
    msg["To"] = to_email

    if body_text:
        msg.attach(MIMEText(body_text, "plain"))
    msg.attach(MIMEText(body_html, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")
        return False


def send_password_reset_email(to_email: str, name: str, reset_token: str, base_url: str) -> bool:
    reset_url = f"{base_url}/reset-password?token={reset_token}"
    subject = "Password Reset — Architecture Studio"
    body_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>Hi {name},</p>
        <p>You requested a password reset for your Architecture Studio account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}"
               style="background: linear-gradient(to right, #3b82f6, #7c3aed); color: white;
                      padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Reset Password
            </a>
        </div>
        <p style="color: #6b7280; font-size: 0.9em;">This link expires in <strong>1 hour</strong>.</p>
        <p style="color: #6b7280; font-size: 0.9em;">If you didn't request this, ignore this email.</p>
        <hr style="border-color: #e5e7eb; margin-top: 30px;" />
        <p style="color: #9ca3af; font-size: 0.8em;">Architecture Design Studio — Kenyatta University</p>
    </div>
    """
    body_text = f"Hi {name},\n\nReset your password here: {reset_url}\n\nThis link expires in 1 hour."
    return send_email(to_email, subject, body_html, body_text)


def send_lecturer_message(to_emails: list[str], subject: str, body: str, lecturer_name: str) -> dict:
    sent, failed = [], []
    body_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Message from your Lecturer</h2>
        <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="white-space: pre-wrap; margin: 0;">{body}</p>
        </div>
        <p style="color: #6b7280; font-size: 0.9em;">Sent by <strong>{lecturer_name}</strong> via Architecture Studio</p>
        <hr style="border-color: #e5e7eb; margin-top: 20px;" />
        <p style="color: #9ca3af; font-size: 0.8em;">Architecture Design Studio — Kenyatta University</p>
    </div>
    """
    for email in to_emails:
        ok = send_email(email, subject, body_html, body)
        (sent if ok else failed).append(email)
    return {"sent": sent, "failed": failed}
