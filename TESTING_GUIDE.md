# API Testing Guide

## Postman Collection Setup

### 1. Import Files
- Import `postman_collection.json` into Postman
- Import `postman_environment.json` as environment
- Select the "Backend Starter Pack Environment"

### 2. Testing Flow

#### Step 1: Authentication
1. **Owner Register** - Create admin account
2. **Owner Login** - Get JWT token (auto-saved to environment)
3. **Get Owner Profile** - Verify authentication

#### Step 2: Setup Organization
1. **Create Organization** - Save `organizationId` from response
2. **Get All Organizations** - Verify creation

#### Step 3: Create Features
1. **Create Feature** - Save `featureId` from response
2. **Get Features by Organization** - Verify creation

#### Step 4: Create Plans
1. **Create Plan** - Use saved `organizationId` and `featureId`
2. **Save `planId`** from response

#### Step 5: Create Users
1. **Create Feature User** - Save `featureUserId` and `featureUserToken`
2. **Create User Plan** - Save `userPlanId` and `userPlanToken`

#### Step 6: Test Usage
1. **Track Usage** - Use `userPlanToken` and `featureId`
2. **Get Usage Stats** - View analytics

### 3. Environment Variables

Update these variables manually after each creation:

```json
{
  "baseUrl": "http://localhost:3000/api",
  "token": "auto-set-after-login",
  "ownerId": "copy-from-register-response",
  "organizationId": "copy-from-create-org-response",
  "featureId": "copy-from-create-feature-response",
  "planId": "copy-from-create-plan-response",
  "featureUserId": "copy-from-create-user-response",
  "userPlanId": "copy-from-create-user-plan-response",
  "featureUserToken": "copy-from-create-user-response",
  "userPlanToken": "copy-from-create-user-plan-response"
}
```

### 4. Authentication Headers

Most endpoints require JWT token:
```
Authorization: Bearer {{token}}
```

### 5. Public Endpoints (No Auth Required)
- `POST /owners/register`
- `POST /owners/login`
- `POST /usage/track`
- `POST /feature-users/validate`
- `POST /user-plans/validate`
- `GET /health`

### 6. Protected Endpoints (Auth Required)
- All other endpoints require valid JWT token

## Sample Test Sequence

1. Register Owner → Login → Get Profile
2. Create Organization → Create Feature → Create Plan
3. Create Feature User → Create User Plan
4. Track Usage → View Analytics
5. Test all CRUD operations

## Error Testing

Test these scenarios:
- Invalid credentials
- Expired tokens
- Missing required fields
- Invalid IDs
- Usage limit exceeded
- Rate limiting

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```