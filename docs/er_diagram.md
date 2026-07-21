# Entity Relationship (ER) Diagram
**EliteHRM Multi-Tenant Schema Blueprint**
*Owner: Shahmeer | Crafted by Shahmeer Akram*

---

EliteHRM leverages a highly structured MongoDB schema configuration enforced through Mongoose models. Data segregation is anchored on the `Org` schema for SaaS tenancy, with strict foreign keys referencing parent documents.

## Schema ER Diagram (Crow's Foot Notation)

```mermaid
erDiagram
    ORG ||--o{ USER : "hosts"
    ORG ||--|| SUBSCRIPTION : "owns"
    USER ||--o{ ATTENDANCE : "registers"
    USER ||--o{ LEAVE : "submits"
    USER ||--o{ ACTIVITY_LOG : "triggers"

    ORG {
        ObjectId _id PK
        string name
        string domain UNIQUE
        string address
        string phone
        string status "active | suspended | trial"
        date createdAt
        date updatedAt
    }

    SUBSCRIPTION {
        ObjectId _id PK
        ObjectId orgId FK
        string plan "starter | professional | enterprise"
        string status "active | inactive | canceled | past_due"
        date startDate
        date endDate
        number price
        string currency "USD"
    }

    USER {
        ObjectId _id PK
        ObjectId orgId FK "optional"
        string firstName
        string lastName
        string email UNIQUE
        string passwordHash
        string role "admin | employee"
        string department
        string designation
        string status "active | inactive"
        string refreshToken
        date joinDate
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId userId FK
        date date
        date checkIn
        date checkOut
        string status "present | late | absent"
        string location
    }

    LEAVE {
        ObjectId _id PK
        ObjectId userId FK
        string leaveType "sick | casual | vacation | other"
        date startDate
        date endDate
        string reason
        string status "pending | approved | rejected"
        ObjectId approvedBy FK
    }

    ACTIVITY_LOG {
        ObjectId _id PK
        ObjectId userId FK "optional"
        string action "LOGIN | LOGOUT | EMPLOYEE_ONBOARD | LEAVE_SUBMIT..."
        string details
        string ipAddress
        string userAgent
        date timestamp
    }
```

## Relational Integrity Constraints

1. **Multi-Tenancy**: The `User` and `Subscription` entities can hold an optional/required `orgId` reference to allow single-tenant data isolation within a multi-tenant environment.
2. **One-to-Many Mappings**: 
   - A single `User` document maps to multiple `Attendance` history documents, `Leave` requests, and administrative `ActivityLog` audits.
3. **Audit Log Integration**: The `ActivityLog` dynamically references `userId` to track exactly which executive or employee initiated critical CRUD actions (like onboarding new staff or changing leave requests).
