# SOS360 API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints available in the SOS360 application, including request and response shapes for frontend integration.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Standard Response Format

All endpoints follow a consistent response format:

```typescript
{
  success: boolean;
  message: string;
  data?: any;
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/login

**Description**: Authenticate user and receive access token

**Request Body**:

```typescript
{
  email: string; // Valid email address
  password: string; // User password
}
```

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Login successful';
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    }
    accessToken: string;
  }
}
```

**Validation Rules**:

- `email`: Must be a valid email address
- `password`: Required, non-empty

---

### POST /auth/register

**Description**: Register new user and create company

**Request Body**:

```typescript
{
  firstName: string; // Required
  lastName: string; // Required
  email: string; // Valid email address
  password: string; // Min 8 chars, must contain: number, lowercase, uppercase, special char
  companyName: string; // Required
}
```

**Response** (Success - 201):

```typescript
{
  success: true;
  message: 'Registration successful.';
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    }
  }
}
```

**Validation Rules**:

- `firstName`: Required, non-empty
- `lastName`: Required, non-empty
- `email`: Must be a valid email address
- `password`: Minimum 8 characters, must contain:
  - At least one number
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one special character (!@#$%^&\*(),.?":{}|<>)
- `companyName`: Required, non-empty

---

### POST /auth/forgot-password

**Description**: Reset user password (Implementation pending)

**Status**: 🚧 Implementation pending

---

### POST /auth/refresh

**Description**: Refresh access token (Implementation pending)

**Status**: 🚧 Implementation pending

---

### POST /auth/logout

**Description**: Logout user (Implementation pending)

**Status**: 🚧 Implementation pending

---

## 🏢 Company Endpoints

All company endpoints require authentication and appropriate role permissions.

### GET /companies/profile

**Description**: Get company profile information

**Authentication**: Required
**Permissions**: Any authenticated user

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Company profile endpoint - implementation pending';
  data: {
    companyId: string;
    note: 'This endpoint will return full company profile information';
  }
}
```

**Status**: 🚧 Implementation pending

---

### PUT /companies/profile

**Description**: Update company profile information

**Authentication**: Required
**Permissions**: Company Admin role required

**Request Body**: (Implementation pending)

```typescript
{
  // Company profile update fields will be defined
}
```

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Company profile update endpoint - implementation pending';
  data: {
    companyId: string;
    note: 'This endpoint will update company profile information';
  }
}
```

**Status**: 🚧 Implementation pending

---

### GET /companies/settings

**Description**: Get company settings and configuration

**Authentication**: Required
**Permissions**: Company Admin role required

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Company settings endpoint - implementation pending';
  data: {
    companyId: string;
    note: 'This endpoint will return company settings and configuration';
  }
}
```

**Status**: 🚧 Implementation pending

---

### PUT /companies/settings

**Description**: Update company settings

**Authentication**: Required
**Permissions**: Executive role required

**Request Body**: (Implementation pending)

```typescript
{
  // Company settings update fields will be defined
}
```

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Company settings update endpoint - implementation pending';
  data: {
    companyId: string;
    note: 'This endpoint will update company settings';
  }
}
```

**Status**: 🚧 Implementation pending

---

### GET /companies/users

**Description**: Get list of company users

**Authentication**: Required
**Permissions**: Company Admin role required

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Company users endpoint - implementation pending';
  data: {
    companyId: string;
    note: 'This endpoint will return list of company users';
  }
}
```

**Status**: 🚧 Implementation pending

---

### GET /companies/stats

**Description**: Get company performance statistics

**Authentication**: Required
**Permissions**: Company Admin role required

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Company statistics endpoint - implementation pending';
  data: {
    companyId: string;
    note: 'This endpoint will return company performance statistics';
  }
}
```

**Status**: 🚧 Implementation pending

---

## 👥 Contact Endpoints

All contact endpoints require authentication and sales access permissions.

### GET /contacts

**Description**: Get paginated list of contacts with optional filtering

**Authentication**: Required
**Permissions**: Sales access required

**Query Parameters**:

```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20
  search?: string;      // Search term
  type?: string;        // Contact type filter
  status?: string;      // Status filter
}
```

**Response** (Success - 200):

```typescript
{
  success: true;
  message: "Contacts list endpoint - implementation pending";
  data: {
    companyId: string;
    filters: {
      page: number;
      limit: number;
      search?: string;
      type?: string;
      status?: string;
    };
    note: "This endpoint will return paginated list of contacts";
  };
}
```

**Status**: 🚧 Implementation pending

---

### GET /contacts/:id

**Description**: Get detailed contact information by ID

**Authentication**: Required
**Permissions**: Sales access required

**Path Parameters**:

- `id`: Contact ID (string)

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Contact detail endpoint - implementation pending';
  data: {
    contactId: string;
    companyId: string;
    note: 'This endpoint will return detailed contact information';
  }
}
```

**Status**: 🚧 Implementation pending

---

### POST /contacts

**Description**: Create new contact

**Authentication**: Required
**Permissions**: Sales access required

**Request Body**:

```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  contactType: string; // e.g., "COMMERCIAL"
  // Additional contact fields will be defined
}
```

**Response** (Success - 201):

```typescript
{
  success: true;
  message: 'Contact creation endpoint - implementation pending';
  data: {
    companyId: string;
    createdBy: string;
    note: 'This endpoint will create a new contact';
  }
}
```

**Status**: 🚧 Implementation pending

---

### PUT /contacts/:id

**Description**: Update existing contact

**Authentication**: Required
**Permissions**: Sales access required

**Path Parameters**:

- `id`: Contact ID (string)

**Request Body**:

```typescript
{
  // Contact update fields will be defined
}
```

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Contact update endpoint - implementation pending';
  data: {
    contactId: string;
    companyId: string;
    updatedBy: string;
    note: 'This endpoint will update contact information';
  }
}
```

**Status**: 🚧 Implementation pending

---

### DELETE /contacts/:id

**Description**: Soft delete contact

**Authentication**: Required
**Permissions**: Sales access required

**Path Parameters**:

- `id`: Contact ID (string)

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Contact deletion endpoint - implementation pending';
  data: {
    contactId: string;
    companyId: string;
    deletedBy: string;
    note: 'This endpoint will soft delete a contact';
  }
}
```

**Status**: 🚧 Implementation pending

---

### POST /contacts/:id/qualify

**Description**: Qualify contact as lead

**Authentication**: Required
**Permissions**: Sales access required

**Path Parameters**:

- `id`: Contact ID (string)

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Contact qualification endpoint - implementation pending';
  data: {
    contactId: string;
    companyId: string;
    qualifiedBy: string;
    note: 'This endpoint will qualify a contact as a lead';
  }
}
```

**Status**: 🚧 Implementation pending

---

### GET /contacts/:id/activities

**Description**: Get contact activity history

**Authentication**: Required
**Permissions**: Sales access required

**Path Parameters**:

- `id`: Contact ID (string)

**Response** (Success - 200):

```typescript
{
  success: true;
  message: 'Contact activities endpoint - implementation pending';
  data: {
    contactId: string;
    companyId: string;
    note: 'This endpoint will return contact activity history';
  }
}
```

**Status**: 🚧 Implementation pending

---

### POST /contacts/:id/notes

**Description**: Add note to contact

**Authentication**: Required
**Permissions**: Sales access required

**Path Parameters**:

- `id`: Contact ID (string)

**Request Body**:

```typescript
{
  note: string; // Note content
}
```

**Response** (Success - 201):

```typescript
{
  success: true;
  message: 'Contact note endpoint - implementation pending';
  data: {
    contactId: string;
    companyId: string;
    addedBy: string;
    note: 'This endpoint will add a note to the contact';
  }
}
```

**Status**: 🚧 Implementation pending

---

## 🔍 System Endpoints

### GET /

**Description**: API root endpoint with system information

**Authentication**: Not required

**Response** (Success - 200):

```typescript
{
  name: string;           // Application name
  version: string;        // API version
  environment: string;    // Current environment
  timestamp: string;      // ISO timestamp
  status: "operational";  // System status
  docs?: string;          // Docs URL (development only)
  endpoints: {
    health: string;       // Health check path
    auth: string;         // Auth endpoints base
    companies: string;    // Companies endpoints base
    contacts: string;     // Contacts endpoints base
  };
}
```

---

## 🔒 Authentication Context

### AuthenticatedRequest Interface

Protected endpoints receive an authenticated request with the following additional properties:

```typescript
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId: string;
    role: string;
    email: string;
    isActive: boolean;
  };
  userId?: string;
  companyId?: string;
  userRole?: string;
}
```

---

## 🚨 Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```typescript
{
  success: false;
  message: 'Validation error message';
  // Additional error details
}
```

### 401 Unauthorized

```typescript
{
  success: false;
  message: 'Authentication required';
}
```

### 403 Forbidden

```typescript
{
  success: false;
  message: 'Insufficient permissions';
}
```

### 404 Not Found

```typescript
{
  success: false;
  message: 'Resource not found';
}
```

### 500 Internal Server Error

```typescript
{
  success: false;
  message: 'Internal server error';
}
```

---

## 📝 Implementation Status

- ✅ **Implemented**: `/auth/login`, `/auth/register`
- 🚧 **Pending Implementation**: All other endpoints are placeholder implementations that return success messages with notes about future implementation

---

## 💡 Usage Examples

### Authentication Flow

```typescript
// 1. Register new user
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password123!',
    companyName: 'Doe Construction',
  }),
});

// 2. Login user
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'Password123!',
  }),
});

const { data } = await loginResponse.json();
const token = data.accessToken;

// 3. Use token for authenticated requests
const profileResponse = await fetch('/api/v1/companies/profile', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Contact Management

```typescript
// Get contacts with filtering
const contactsResponse = await fetch('/api/v1/contacts?page=1&limit=10&search=john', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Create new contact
const newContactResponse = await fetch('/api/v1/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    contactType: 'COMMERCIAL',
  }),
});
```

---

This documentation will be updated as endpoints are implemented and new features are added to the API.
