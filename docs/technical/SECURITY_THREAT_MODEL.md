# Security & Threat Model

## Security Architecture
The application implements a multi-layer security approach suitable for enterprise evaluation.

### 1. Authentication & Authorization
*   **Mechanism:** JSON Web Tokens (JWT).
*   **Strategy:** Stateless authentication for the REST API.
*   **Protection:** "Public" routes are Read-Only (Dashboard analytics), while "Private" routes (Importing, Single Publish) require a valid Bearer Token.

### 2. Database Protection
*   **Access Control:** The database is containerized and restricted to the internal Docker network. Only the `5433` port is exposed for local development, different from the standard `5432` to avoid host machine collisions.
*   **ORM Layer:** By using Prisma, we automatically benefit from **Parameterized Queries**, which provide 100% protection against SQL Injection attacks.

### 3. Threat Model (STRIDE Analysis)
| Threat | Mitigation |
| :--- | :--- |
| **Spoofing** | JWT-based identity verification for all data modification requests. |
| **Tampering** | Deep data validation using TypeScript interfaces during CSV parsing. |
| **Information Disclosure** | Environment variables (.env) are never committed to source control (handled via `.gitignore`). |
| **Denial of Service** | Fastify's built-in body parsing limits prevent memory exhaustion during large file uploads. |

## Compliance Decisions
*   **PII (Personally Identifiable Information):** The system intentionally stores zero PII. All KPIs are business-related (Company/Retailer), reducing the regulatory surface (GDPR/CCPA).
*   **Integrity:** Unique composite constraints ensure that data cannot be corrupted by redundant imports or duplicate snapshots.
