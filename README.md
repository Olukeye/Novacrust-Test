# Demo Credit Wallet API

A robust MVP wallet service built with NodeJS, TypeScript, PostgresQL, and Prisma 7 for managing user accounts, funds, and peer-to-peer transactions.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)

## Architecture Overview

### Technology Stack
- **Runtime**: Node.js (LTS v25.x)
- **Language**: TypeScript
- **Database**: Postgres 8.0
- **ORM**: Prisma 7

### Design Principles
1. **Layered Architecture**: Separation of concerns with Controllers, Services, and Data Access layers
2. **SOLID Principles**: Single responsibility, dependency injection
3. **Transaction Safety**: All financial operations wrapped in database transactions
4. **Idempotency**: Transaction references prevent duplicate operations
5. **Audit Trail**: Complete logging of all wallet activities

### Project Structure
```
src/
├── config/          # Configuration files (database, environment)
├── controllers/     # Request handlers
├── services/        # Business logic layer
├── models/          # Database models and types
├── middleware/      # Authentication, validation, error handling
├── utils/           # Helper functions
├── routes/          # API route definitions
├── database/
│   └── seeds/       # Test data seeds
└── tests/           # Unit and integration tests
```

## Database Design

### Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     Users       │         │    Wallets       │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │────────<│ id (PK)          │
│ email           │    1:1  │ user_id (FK)     │
│ firstName       │         │ balance          │
│ lastName        │         │ currency         │
│ phone           │         │ created_at       │
│ is_blacklisted  │         │ updated_at       │
│ created_at      │         └──────────────────┘
│ updated_at      │                 │
└─────────────────┘                 │ 1:M
                                    │
                          ┌─────────▼──────────┐
                          │   Transactions     │
                          ├────────────────────┤
                          │ id (PK)            │
                          │ wallet_id (FK)     │
                          │ type               │
                          │ amount             │
                          │ reference          │
                          │ description        │
                          │ recipient_wallet   │
                          │ status             │
                          │ metadata           │
                          │ created_at         │
                          └────────────────────┘
```

### Indexes
- `users.email` - UNIQUE index
- `transactions.reference` - UNIQUE index for idempotency
- `transactions.wallet_id` - For transaction history queries
- `wallets.user_id` - UNIQUE index for one-to-one relationship

## API Documentation

### Authentication
All endpoints (except user creation) require a Bearer token:
```
Authorization: Bearer <token>
```

### Endpoints

#### 1. Create User Account
```http
POST api/v1//users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678"
}

Response: 201 Created
{
	"success": true,
	"message": "User created successfully",
	"data": {
		"message": "User created successfully",
		"data": {
			"id": "ded3b9b9-cb80-4326-b6f2-afcca2bf4f4d",
			"email": "user@example.com"",
			"firstName": "Bunmi",
			"lastName": "Olukeye",
			"phone": "0808888888",
			"isBlacklisted": false,
			"createdAt": "2025-12-16T13:14:48.430Z",
			"updatedAt": "2025-12-16T13:14:48.430Z"
		}
	},
	"timestamp": "2025-12-16T13:14:48.433Z"
}

POST/api/v1/users/login
Content-Type: application/json
{
  "email": "user@example.com",
}
Response: 200 OK
{
	"success": true,
	"message": "Request successful",
	"data": {
		"user": {
			"id": "ded3b9b9-cb80-4326-b6f2-afcca2bf4f4d",
			"email": "user@example.com"",
			"firstName": "Bunmi",
			"lastName": "Olukeye",
			"phone": "0808888888",
			"isBlacklisted": false
		},
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZWQzYjliOS1jYjgwLTQzMjYtYjZmMi1hZmNjYTJiZjRmNGQiLCJlbWFpbCI6ImJ1bm1pQGdtYWlsLmNvbSIsImV4cGlyZXNJbiI6IjZoIiwiaWF0IjoxNzY1ODkyMTkxLCJleHAiOjE3NjU5Nzg1OTF9.dP8qPHzhJD9_P0Yquwbu9VIKr-5UCmZl4jvAofwTO0c"
	},
	"timestamp": "2025-12-16T13:36:31.357Z"
}
```

#### 2. Fund Account
```http
POST /wallets/fund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000.00,
  "reference": "REF123456789"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "transaction": {
      "id": 1,
      "amount": "5000.00",
      "balance": "5000.00",
      "reference": "REF123456789",
      "createdAt": "2025-10-23T10:30:00Z"
    }
  }
}
```

#### 3. Transfer Funds
```http
POST /wallets/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientEmail": "recipient@example.com",
  "amount": 1000.00,
  "description": "Payment for services"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "transaction": {
      "id": 2,
      "amount": "1000.00",
      "balance": "4000.00",
      "recipient": "recipient@example.com",
      "reference": "TXN1634982600000",
      "createdAt": "2025-10-23T10:35:00Z"
    }
  }
}
```

#### 5. Get Wallet Infor
Response: 200 OK
{
  "status": "success",
  "data": {
		"id": "8f9216ea-5bd9-4b88-a2bf-15bafea01eaa",
		"userId": "a11c4059-de20-44d1-a316-693e1df15083",
		"balance": "300",
		"currency": "USD",
		"account_name": "Wale oshman",
		"wallet_token": "2640568031",
		"createdAt": "2025-12-16T08:48:36.454Z",
		"updatedAt": "2025-12-16T08:48:36.454Z"
	},
}
```

#### 6. Get Transaction History
```http
GET /wallets/transactions
Authorization: Bearer <token>

Response: 200 OK
{
	"success": true,
	"message": "Request successful",
	"data": {
		"page": 1,
		"limit": 20,
		"total": 10,
		"data": [
			{
				"id": "a6f56f92-b226-4aec-abef-1f8387b658dc",
				"walletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"userId": "ded3b9b9-cb80-4326-b6f2-afcca2bf4f4d",
				"type": "TRANSFER",
				"amount": "40",
				"reference": "TRNX-MJ8MO5FL-FWLXTPXHJA",
				"description": "Thank you for the money",
				"recipientWalletId": "16076195-db47-4930-96f8-fbf1e89068d8",
				"status": "COMPLETED",
				"metadata": {
					"recipientWalletId": "16076195-db47-4930-96f8-fbf1e89068d8"
				},
				"createdAt": "2025-12-16T13:38:02.248Z"
			},
			{
				"id": "dd58d2ac-690f-4b3b-9993-600abb6cddb1",
				"walletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"userId": "ded3b9b9-cb80-4326-b6f2-afcca2bf4f4d",
				"type": "TRANSFER",
				"amount": "40",
				"reference": "TRNX-MJ8MNKH0-590JBTIWZA",
				"description": "Thank you for the money",
				"recipientWalletId": "16076195-db47-4930-96f8-fbf1e89068d8",
				"status": "COMPLETED",
				"metadata": {
					"recipientWalletId": "16076195-db47-4930-96f8-fbf1e89068d8"
				},
				"createdAt": "2025-12-16T13:37:35.089Z"
			},
			{
				"id": "3eb1b102-6d23-44bd-87ad-6ffe610d82b0",
				"walletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"userId": "ded3b9b9-cb80-4326-b6f2-afcca2bf4f4d",
				"type": "CREDIT",
				"amount": "45",
				"reference": "TRNX-MJ8LWLE2-HMDOFQZKTG_CREDIT",
				"description": "Happy Happy",
				"recipientWalletId": null,
				"status": "COMPLETED",
				"metadata": {
					"senderWalletId": "16076195-db47-4930-96f8-fbf1e89068d8"
				},
				"createdAt": "2025-12-16T13:16:36.559Z"
			},
			{
				"id": "b76256e5-360c-4bce-a0cc-bcf9b4cced45",
				"walletId": "16076195-db47-4930-96f8-fbf1e89068d8",
				"userId": "d6b4411b-0eb4-41fc-9647-c06e6d376c8d",
				"type": "TRANSFER",
				"amount": "45",
				"reference": "TRNX-MJ8LWLE2-HMDOFQZKTG",
				"description": "Happy Happy",
				"recipientWalletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"status": "COMPLETED",
				"metadata": {
					"recipientWalletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3"
				},
				"createdAt": "2025-12-16T13:16:36.558Z"
			},
			{
				"id": "56a33c68-8f4c-4af2-bde6-e794ac67a14f",
				"walletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"userId": "ded3b9b9-cb80-4326-b6f2-afcca2bf4f4d",
				"type": "CREDIT",
				"amount": "80",
				"reference": "TRNX-MJ8LWG1J-XNJMUV5HDA_CREDIT",
				"description": "Happy Happy",
				"recipientWalletId": null,
				"status": "COMPLETED",
				"metadata": {
					"senderWalletId": "16076195-db47-4930-96f8-fbf1e89068d8"
				},
				"createdAt": "2025-12-16T13:16:29.628Z"
			},
			{
				"id": "3ac854af-5afb-438c-acb9-169db1d5ddc1",
				"walletId": "16076195-db47-4930-96f8-fbf1e89068d8",
				"userId": "d6b4411b-0eb4-41fc-9647-c06e6d376c8d",
				"type": "TRANSFER",
				"amount": "80",
				"reference": "TRNX-MJ8LWG1J-XNJMUV5HDA",
				"description": "Happy Happy",
				"recipientWalletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"status": "COMPLETED",
				"metadata": {
					"recipientWalletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3"
				},
				"createdAt": "2025-12-16T13:16:29.627Z"
			},
			{
				"id": "9c41245f-bf89-44b3-b16b-d625046ce39d",
				"walletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"userId": "ded3b9b9-cb80-4326-b6f2-afcca2bf4f4d",
				"type": "CREDIT",
				"amount": "15",
				"reference": "TRNX-MJ8LWAWR-OJ719W9SEQ_CREDIT",
				"description": "Happy Happy",
				"recipientWalletId": null,
				"status": "COMPLETED",
				"metadata": {
					"senderWalletId": "16076195-db47-4930-96f8-fbf1e89068d8"
				},
				"createdAt": "2025-12-16T13:16:22.981Z"
			},
			{
				"id": "3e9ee8b0-8682-41cc-a6b4-518c0dd528a8",
				"walletId": "16076195-db47-4930-96f8-fbf1e89068d8",
				"userId": "d6b4411b-0eb4-41fc-9647-c06e6d376c8d",
				"type": "TRANSFER",
				"amount": "15",
				"reference": "TRNX-MJ8LWAWR-OJ719W9SEQ",
				"description": "Happy Happy",
				"recipientWalletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"status": "COMPLETED",
				"metadata": {
					"recipientWalletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3"
				},
				"createdAt": "2025-12-16T13:16:22.978Z"
			},
			{
				"id": "dd3772e9-907b-48ad-9aaa-a24d7180d8fd",
				"walletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"userId": "ded3b9b9-cb80-4326-b6f2-afcca2bf4f4d",
				"type": "CREDIT",
				"amount": "100",
				"reference": "TRNX-MJ8LW2W7-CJBNVEPDMQ_CREDIT",
				"description": "Happy Happy",
				"recipientWalletId": null,
				"status": "COMPLETED",
				"metadata": {
					"senderWalletId": "16076195-db47-4930-96f8-fbf1e89068d8"
				},
				"createdAt": "2025-12-16T13:16:12.593Z"
			},
			{
				"id": "67dbcad0-fe90-4cc9-bdca-97c4533fd6fb",
				"walletId": "16076195-db47-4930-96f8-fbf1e89068d8",
				"userId": "d6b4411b-0eb4-41fc-9647-c06e6d376c8d",
				"type": "TRANSFER",
				"amount": "100",
				"reference": "TRNX-MJ8LW2W7-CJBNVEPDMQ",
				"description": "Happy Happy",
				"recipientWalletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3",
				"status": "COMPLETED",
				"metadata": {
					"recipientWalletId": "8826a4bb-9200-4c65-bf8b-04b835a531d3"
				},
				"createdAt": "2025-12-16T13:16:12.589Z"
			}
		]
	},
	"timestamp": "2025-12-16T13:38:38.491Z"
}
```

### Error Responses

```json
{
  "status": "error",
  "message": "Insufficient funds",
  "code": "INSUFFICIENT_FUNDS"
}
```

Common error codes:
- `INSUFFICIENT_FUNDS` - Wallet balance too low
- `INVALID_RECIPIENT` - Recipient not found
- `DUPLICATE_REFERENCE` - Transaction already processed
- `VALIDATION_ERROR` - Invalid request data

## Setup Instructions

### Prerequisites
- Node.js v25.x or higher
- Prisma 7.0
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone
cd demo-credit-wallet
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/WalletTestDB"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Adjutor Karma API
ADJUTOR_API_URL=https://adjutor.lendsqr.com/v2
ADJUTOR_API_KEY=your-api-key
```

4. Run database migrations
```bash
npm run migrate
```

5. (Optional) Seed test data
```bash
npm run seed
```

6. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Testing

### Run All Tests
```bash
npm test
```

### Test Structure
```
tests/
├── unit/
│   ├── services/
│   │   ├── user.service.test.ts
│   │   ├── wallet.service.test.ts
│   │   └── transaction.service.test.ts
│   └── utils/
│       └── validators.test.ts
└── integration/
    ├── user.routes.test.ts
    ├── wallet.routes.test.ts
    └── transaction.routes.test.ts
```

### Test Coverage Requirements
- Minimum 80% code coverage
- Positive and negative test scenarios
- Edge cases (concurrent transactions, race conditions)

## Implementation Decisions

### 1. Transaction Safety
**Decision**: All financial operations use database transactions with row-level locking.

**Rationale**: Prevents race conditions in concurrent transfers. `SELECT ... FOR UPDATE` ensures balance checks and updates are atomic.

### 2. Idempotency Keys
**Decision**: Unique reference required for funding operations.

**Rationale**: Prevents duplicate charges if a request is retried due to network issues.

### 3. Soft Balance Checks
**Decision**: Balance validation happens within the transaction scope, not before.

**Rationale**: Eliminates TOCTOU (Time-of-Check-Time-of-Use) vulnerabilities.

### 4. Adjutor Integration
**Decision**: Blacklist check happens synchronously during registration.

**Rationale**: Per requirements, blacklisted users should never be onboarded.

### 5. Token-Based Authentication
**Decision**: Simple JWT with user ID payload.

## Security Considerations

1. **Input Validation**: All inputs validated with Joi schemas
2. **SQL Injection**: Parameterized queries via KnexJS
4. **Amount Validation**: Only positive values accepted
5. **Error Messages**: Generic messages to prevent information leakage


## Known Limitations

1. Single currency support (USD only)
2. No withdrawal bank integration (mock implementation)
3. Simplified authentication
4. No email notifications
5. No transaction reversal mechanism
