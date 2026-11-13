# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Ocean Drive development team takes system and data security seriously. If you discover a vulnerability or potential security risk in this application or its backend services, please report it responsibly:

1. **Do not disclose the vulnerability publicly.**
2. Send an email to [reservas@oceandrivecarental.com](mailto:reservas@oceandrivecarental.com) with the subject `[SECURITY VULNERABILITY] <Component/Endpoint>`.
3. Provide detailed steps to reproduce the issue, including request payloads, HTTP methods, and potential impact.
4. Our security response team will acknowledge receipt within 48 business hours and provide a timeline for triage and resolution.

## Security Practices in this Repository

- **Environment Isolation:** Secrets, database credentials, and SMTP credentials must strictly reside in `.env` and are strictly excluded via `.gitignore`. Never commit `.env` or sensitive `.pem` / `.key` files.
- **Backend Defense:** The PHP API incorporates PDO prepared statements (SQL injection prevention), `RateLimiter` token-bucket rate limiting against DDoS/brute-force attacks, and CORS restriction to authorized origins.
- **Frontend Hygiene:** Angular 19 DomSanitizer, strict TypeScript checks, and client-side sanitization prevent XSS attacks across all user input surfaces.
