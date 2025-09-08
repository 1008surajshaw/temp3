# 🔐 TOKEN SYSTEM EXPLANATION

## 🎯 Two Different Token Types

### **1. JWT Token (Owner/Admin Authentication)**
- **Purpose**: Admin authentication and authorization
- **Expiry**: 24 hours
- **Contains**: Owner ID, email, account type, organization ID
- **Usage**: Admin panel access, API management
- **Renewal**: Manual login required after expiry

### **2. Feature User Tokens (User Access)**
- **Purpose**: User access to features and usage tracking
- **Expiry**: NO EXPIRY (permanent until manually changed)
- **Contains**: Random hex string (not JWT)
- **Usage**: API usage tracking, feature access
- **Renewal**: Only when plan changes or manual regeneration

---

## 🔄 How Tokens Work

### **JWT Token Flow (Admin)**
```
1. Admin Login → POST /api/owners/login
2. Server generates JWT with 24h expiry
3. Frontend stores token in localStorage
4. All admin API calls use: Authorization: Bearer <jwt_token>
5. After 24h → Token expires → Need to login again
```

### **Feature User Token Flow (End Users)**
```
1. Admin creates feature user → Generates permanent access token
2. Admin assigns plan to user → Generates permanent plan token  
3. User uses plan token for API calls → POST /api/usage/track
4. Token never expires unless:
   - Plan is changed (new token generated)
   - User is deactivated
   - Manual token regeneration
```

---

## 🔧 Token Generation Code

### **JWT Token (24h expiry)**
```typescript
// src/utils/jwt.ts
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h"  // Expires in 24 hours
  });
};
```

### **Feature User Token (No expiry)**
```typescript
// src/utils/tokenGenerator.ts
export const generateAccessToken = (): string => {
  return crypto.randomBytes(32).toString('hex'); // Random 64-char hex
};

export const generatePlanToken = (userId: string, planId: string): string => {
  const timestamp = Date.now().toString();
  const data = `${userId}-${planId}-${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};
```

---

## 🔄 Token Renewal Process

### **JWT Token Renewal (Admin)**
```typescript
// Frontend: Check token expiry
const token = localStorage.getItem('authToken');
const payload = jwt.decode(token);

if (payload.exp * 1000 < Date.now()) {
  // Token expired - redirect to login
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}

// OR: Automatic renewal before expiry
if (payload.exp * 1000 - Date.now() < 300000) { // 5 minutes before expiry
  // Call refresh endpoint or re-login
  await refreshToken();
}
```

### **Feature User Token (No Renewal Needed)**
```typescript
// These tokens don't expire, but can be validated
const response = await fetch('/api/user-plans/validate', {
  method: 'POST',
  body: JSON.stringify({ accessToken: userPlanToken })
});

// Only fails if:
// - Plan is deactivated
// - Plan is expired (expiryDate passed)
// - User is deactivated
```

---

## 📊 New API: Get User Complete Details

### **Endpoint**: `POST /api/user/details`

### **Request**:
```json
{
  "accessToken": "user_plan_token_here"
}
```

### **Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@company.com",
      "isActive": true
    },
    "plan": {
      "id": "plan_id",
      "name": "Business Plan",
      "description": "Business tier features",
      "price": 50,
      "billingCycle": "monthly"
    },
    "subscription": {
      "id": "user_plan_id",
      "purchaseDate": "2024-01-01T00:00:00.000Z",
      "expiryDate": "2024-12-31T23:59:59.000Z",
      "isActive": true,
      "daysRemaining": 120
    },
    "features": [
      {
        "featureId": "feature_id",
        "featureName": "Email Service",
        "featureDescription": "Send emails via API",
        "limit": 1000,
        "currentUsage": 250,
        "remaining": 750,
        "isUnlimited": false,
        "usagePercentage": 25,
        "lastUsed": "2024-01-15T10:30:00.000Z"
      },
      {
        "featureId": "feature_id_2",
        "featureName": "SMS Service", 
        "featureDescription": "Send SMS messages",
        "limit": "unlimited",
        "currentUsage": 50,
        "remaining": "unlimited",
        "isUnlimited": true,
        "usagePercentage": 0,
        "lastUsed": "2024-01-14T15:20:00.000Z"
      }
    ],
    "organization": {
      "id": "org_id",
      "name": "Google Inc"
    }
  }
}
```

---

## 🎨 Frontend Implementation

### **User Dashboard Component**
```typescript
const UserDashboard = ({ userPlanToken }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch('/api/user/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: userPlanToken })
      });
      
      const result = await response.json();
      if (result.success) {
        setUserDetails(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!userDetails) return <div>No data found</div>;

  return (
    <div className="user-dashboard">
      <h1>Welcome, {userDetails.user.name}</h1>
      
      {/* Plan Info */}
      <div className="plan-info">
        <h2>{userDetails.plan.name}</h2>
        <p>${userDetails.plan.price}/{userDetails.plan.billingCycle}</p>
        <p>Expires in {userDetails.subscription.daysRemaining} days</p>
      </div>

      {/* Feature Usage */}
      <div className="features-usage">
        <h3>Feature Usage</h3>
        {userDetails.features.map(feature => (
          <div key={feature.featureId} className="feature-card">
            <h4>{feature.featureName}</h4>
            <p>{feature.featureDescription}</p>
            
            <div className="usage-bar">
              <div className="usage-info">
                <span>Used: {feature.currentUsage}</span>
                <span>Limit: {feature.limit}</span>
                <span>Remaining: {feature.remaining}</span>
              </div>
              
              {!feature.isUnlimited && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${feature.usagePercentage}%` }}
                  />
                </div>
              )}
            </div>
            
            {feature.lastUsed && (
              <p className="last-used">
                Last used: {new Date(feature.lastUsed).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔄 Token Lifecycle Summary

### **JWT Tokens (Admin)**
- ✅ **Secure**: Signed and verified
- ⏰ **24h Expiry**: Automatic security
- 🔄 **Manual Renewal**: Login required
- 🎯 **Usage**: Admin operations only

### **Feature User Tokens (End Users)**  
- 🔐 **Permanent**: No expiry time
- 🎲 **Random**: Crypto-generated hex
- 🔄 **Plan-based Renewal**: Only when plan changes
- 🎯 **Usage**: Feature access and tracking

**The system uses permanent tokens for users because they need consistent API access without frequent re-authentication!**