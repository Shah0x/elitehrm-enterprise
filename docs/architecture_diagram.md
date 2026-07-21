# System Architecture Diagram
**EliteHRM Enterprise Application Suite**
*Owner: Shahmeer | Crafted by Shahmeer Akram*

---

The EliteHRM application is designed with a modern, high-availability, full-stack architecture that maximizes security, scalability, and loose-coupling between services.

## Architecture Topology

```mermaid
graph TD
    subgraph Client Tier (Frontend SPA)
        Vite[Vite + React 18]
        Tailwind[Tailwind CSS v4 Styling]
        Context[React AuthContext & Theme Engine]
    end

    subgraph API Gateway / Middleware Tier
        Express[Node.js + Express Web Server]
        AuthMW[JWT Auth Middleware & Silent Refresh]
        RBAC[Role-Based Access Control]
    end

    subgraph Service Layer (Business Logic)
        EmailSvc[Nodemailer Notification Engine]
        GeminiSvc[Gemini 3.5 Flash Analytics Svc]
    end

    subgraph Data Store Tier
        MongoDB[(MongoDB Atlas Multi-Tenant DB)]
    end

    %% Flow lines
    Vite -->|Secure Cookies HTTP Only| Express
    Express --> AuthMW --> RBAC
    RBAC --> EmailSvc
    RBAC --> GeminiSvc
    EmailSvc -->|Log Events / Alerts| MongoDB
    GeminiSvc -->|JSON Strategic Analysis| MongoDB
```

## Tier Explanations

### 1. Client Tier (Frontend)
- **Vite & React**: Compiles as a highly-optimized Single Page Application (SPA).
- **Tailwind CSS v4**: Utility-first styling coupled with semantic Dark/Light theme selectors on the `documentElement`.
- **Stateless Router Protection**: Pages are gated client-side using `PrivateRoute` checks while the underlying data layer is securely guarded behind Express middlewares.

### 2. API Gateway & Middleware Tier (Express Backend)
- **JWT Authentication Engine**: Features a short-lived Access Token (15-minute HTTP-only cookie) coupled with a long-lived Refresh Token (7-day HTTP-only cookie).
- **Silent Session Renewer**: The backend `authenticate` middleware automatically detects expired access tokens and seamlessly renews them using secure refresh-token database matching and cookie rotation without interrupting client requests.
- **RBAC (Role-Based Access Control)**: Enforces precise access constraints (`authorize(['admin'])`) on critical management and employee-onboarding routers.

### 3. Service Layer (Integrations)
- **Gemini AI Service**: Constructs prompts dynamically from real-time attendance and leave models and uses `gemini-3.5-flash` with a strict JSON schema to return elite HR business insights.
- **Nodemailer Service**: Handles automated transactional email workflows (such as onboarding welcome letters and leave request status notifications) with a safe console-logger fallback mechanism for local testing.

### 4. Data Store Tier (Database)
- **Mongoose / MongoDB Atlas**: Flexible, schema-based, high-performance database with structured schemas for multi-tenant Organizations (`Org`), Subscribers (`Subscription`), Audit Trails (`ActivityLog`), Users, Attendance logs, and Leave requests.
