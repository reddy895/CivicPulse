# Security and Deployment

## Required deployment configuration

- Set `CIVICPULSE_ENV=production` on the API. Production mode disables `/docs` and `/redoc`, requires an explicit origin allowlist, and enables HSTS.
- Set `CIVICPULSE_ALLOWED_ORIGINS` to a comma-separated list of exact HTTPS frontend origins. Wildcard origins are rejected in production.
- Leave `CIVICPULSE_DEMO_MODE` unset or set it to `false`. Demo identities are disabled by default and must never be enabled for a public deployment.
- For an isolated evaluation environment only, set backend `CIVICPULSE_DEMO_MODE=true` to enable the seeded accounts used by the one-click citizen and government demo sign-in buttons. The buttons are visible in the frontend, but authentication fails unless the backend demo accounts are enabled. These seeded accounts are public test identities, and the government identity can perform privileged actions; do not enable demo mode against production data or a public production API.
- Set `CIVICPULSE_SESSION_TTL_SECONDS` to the organization-approved session lifetime. The default is eight hours.
- Set `VITE_API_BASE_URL` at frontend build time when the API is not served from the same origin. Otherwise the frontend uses `/api`.
- Terminate TLS at a trusted ingress, restrict ingress to the API and frontend, and store secrets in the deployment platform's secret manager.

## Authentication behavior

Citizen registration is public; government registration is rejected and government identities must be provisioned by an administrator. Passwords use PBKDF2-HMAC-SHA256 with per-password salts, session tokens are random bearer values with expiration, and government actions require a government session. The browser validates restored sessions with the API instead of trusting cached profile data.

The current user and session stores are in-memory. They are suitable only for a single-process demonstration and are lost on restart; production deployments need a durable database, shared session/revocation storage, administrative provisioning, and operational account recovery before handling real users. Do not treat this repository's demo data or authentication as a certified identity system.

## CI checks

Pull requests run the backend test suite, frontend lint and production build, plus Python and production npm dependency audits. Review audit findings and update dependency constraints before deployment; passing CI is not a substitute for a security review or infrastructure hardening.