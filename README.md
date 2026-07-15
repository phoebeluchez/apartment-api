# Apartment Maintenance Request System (PropTech API)

A RESTful API for managing apartment maintenance requests, built with a multi-role architecture supporting Tenants, Maintenance Staff, and Admins/Landlords.

## Tech Stack

- **Runtime:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT, bcrypt
- **Validation:** Joi
- **File Storage:** Cloudinary (via Multer)
- **Architecture:** MVC

## Features

- JWT-based authentication with role-based authorization (tenant, staff, admin)
- Tenant identity verification workflow (document upload → admin approval)
- Maintenance request CRUD with image uploads
- Assignment of requests to staff
- Status lifecycle tracking (`open → assigned → in_progress → resolved → closed`)
- Comments on requests
- In-app notifications on assignment and status changes
- Pagination, filtering, sorting, and search on request listings
- Global error handling

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Installation

\`\`\`bash
git clone <your-repo-url>
cd apartment-maintenance-system
npm install
\`\`\`

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

\`\`\`
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

### Run the server

\`\`\`bash
npm run dev     # development, with auto-restart
npm start       # production
\`\`\`

### First Admin Account (Bootstrap)

Public registration only creates **tenant** accounts, and creating staff/admin accounts requires an existing admin token — so the very first admin must be seeded manually:

\`\`\`bash
node seed-admin.js
\`\`\`

Edit the email/password inside `seed-admin.js` before running. This only needs to be run once per environment.

## Roles & Permissions

| Action | Tenant | Staff | Admin |
|---|---|---|---|
| Register (self) | ✅ (pending verification) | ❌ | ❌ |
| Create staff/admin accounts | ❌ | ❌ | ✅ |
| Verify/reject tenant accounts | ❌ | ❌ | ✅ |
| Create maintenance request | ✅ | ❌ | ❌ |
| View own requests | ✅ | — | — |
| View assigned requests | — | ✅ | — |
| View all requests | ❌ | ❌ | ✅ |
| Assign staff to request | ❌ | ❌ | ✅ |
| Update request status | ❌ | ❌ | ✅ |
| Delete request | ✅ (own, only if `open`) | ❌ | ✅ (any) |
| Comment on accessible request | ✅ | ✅ | ✅ |

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | Public (tenant only, requires document) |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Authenticated |
| POST | `/api/v1/auth/create-staff` | Admin only |

### Users (Verification)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/users/pending` | Admin only |
| PATCH | `/api/v1/users/:id/verify` | Admin only |
| PATCH | `/api/v1/users/:id/reject` | Admin only |

### Maintenance Requests
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/requests` | Tenant only |
| GET | `/api/v1/requests` | Authenticated (scoped by role) |
| GET | `/api/v1/requests/:id` | Owner / assigned staff / admin |
| PATCH | `/api/v1/requests/:id/assign` | Admin only |
| PATCH | `/api/v1/requests/:id/status` | Admin only |
| DELETE | `/api/v1/requests/:id` | Owner (if `open`) / admin |

**Query params supported on `GET /requests`:** `status`, `priority`, `category`, `search`, `sort`, `page`, `limit`

### Comments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/requests/:requestId/comments` | Users with access to the request |
| GET | `/api/v1/requests/:requestId/comments` | Users with access to the request |
| DELETE | `/api/v1/requests/:requestId/comments/:id` | Comment author / admin |

### Notifications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/notifications` | Authenticated (own notifications) |
| PATCH | `/api/v1/notifications/:id/read` | Authenticated (own notifications) |

## Database Schema

See [`docs/schema.md`](./docs/schema.md) for full collection structure and relationships.

## Postman Collection

Import [`docs/postman_collection.json`](./docs/postman_collection.json) into Postman to test all endpoints. Set the `baseUrl` collection variable to your local or deployed API URL.

## Deployment

Deployed on Render: `<your-render-url-here>`

## License

MIT