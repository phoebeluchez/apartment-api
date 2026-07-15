# Database Schema

## Collections Overview

The system uses 4 MongoDB collections: `users`, `maintenancerequests`, `comments`, `notifications`.

---

## users

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | Full name |
| `email` | String | Unique, used for login |
| `password` | String | Bcrypt-hashed, never returned in queries |
| `role` | String | `tenant` \| `staff` \| `admin` |
| `apartmentUnit` | String | Tenant's unit number |
| `phone` | String | Optional |
| `verificationStatus` | String | `pending` \| `verified` \| `rejected` (tenants only; staff/admin auto-verified) |
| `verificationDocument` | Object | `{ url, publicId }` — Cloudinary reference to lease/ID doc |
| `rejectionReason` | String | Set if admin rejects a tenant |
| `createdAt` / `updatedAt` | Date | Timestamps |

---

## maintenancerequests

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `tenantId` | ObjectId | References `users` — the tenant who created it |
| `title` | String | Short summary |
| `description` | String | Full details |
| `category` | String | `plumbing` \| `electrical` \| `hvac` \| `appliance` \| `structural` \| `pest` \| `other` |
| `priority` | String | `low` \| `medium` \| `high` \| `urgent` |
| `status` | String | `open` \| `assigned` \| `in_progress` \| `resolved` \| `closed` |
| `assignedTo` | ObjectId | References `users` — the staff member assigned (nullable) |
| `images` | Array | `[{ url, publicId }]` — Cloudinary references |
| `resolvedAt` | Date | Set when status becomes `resolved` |
| `createdAt` / `updatedAt` | Date | Timestamps |

---

## comments

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `requestId` | ObjectId | References `maintenancerequests` |
| `authorId` | ObjectId | References `users` |
| `text` | String | Comment content |
| `createdAt` / `updatedAt` | Date | Timestamps |

---

## notifications

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId | References `users` — recipient |
| `requestId` | ObjectId | References `maintenancerequests` |
| `type` | String | `assigned` \| `status_updated` |
| `message` | String | Human-readable notification text |
| `read` | Boolean | Default `false` |
| `createdAt` / `updatedAt` | Date | Timestamps |

---

## Relationships

```
users (1) ──< (many) maintenancerequests   [tenantId]
users (1) ──< (many) maintenancerequests   [assignedTo]
maintenancerequests (1) ──< (many) comments
users (1) ──< (many) comments              [authorId]
maintenancerequests (1) ──< (many) notifications
users (1) ──< (many) notifications         [userId]
```