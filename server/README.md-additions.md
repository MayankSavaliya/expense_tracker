## File Upload

### Receipt Image Upload
When creating or updating an expense, you can attach a receipt image:

1. Convert the image to a base64 string
2. Include it in the `receiptImage` field of the expense
3. Maximum image size: 5MB
4. Supported formats: JPEG, PNG, GIF

Example JavaScript code to convert an image to base64:
```javascript
function convertImageToBase64(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    callback(reader.result);
  };
  reader.onerror = error => {
    console.error('Error converting image to base64:', error);
  };
}

// Usage
const fileInput = document.getElementById('receipt-image');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  convertImageToBase64(file, (base64String) => {
    // Use base64String in your API request
    console.log(base64String);
  });
});
```

## Rate Limiting

API endpoints have rate limiting to prevent abuse:

| Endpoint Type | Rate Limit                   | Limit Reset   |
|---------------|------------------------------|---------------|
| Public        | 60 requests per IP per hour  | Hourly        |
| Authenticated | 1000 requests per user per hour | Hourly     |

When rate limit is exceeded, the API will respond with status code 429 (Too Many Requests) and headers:
- `X-RateLimit-Limit`: Total requests allowed per time window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Time (in Unix timestamp) when the rate limit resets

## Client Integration Examples

### JavaScript (Fetch API)
```javascript
// Login example
async function login(email, password) {
  try {
    const response = await fetch('https://your-api.com/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error.message || 'Login failed');
    }
    
    // Store token for later use
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Authenticated request example
async function getMyExpenses() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch('https://your-api.com/api/expenses/my-expenses', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error.message || 'Failed to fetch expenses');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}
```

### React / Next.js Example
```javascript
import { useState, useEffect } from 'react';

// Custom hook for authenticated API requests
function useAuthFetch() {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });

  const authFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(`https://your-api.com/api${url}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 by redirecting to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error(data.error.message || 'API request failed');
    }

    return data.data;
  };

  return { authFetch, token, setToken };
}

// Example component
function ExpensesList() {
  const { authFetch } = useAuthFetch();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const data = await authFetch('/expenses/my-expenses');
        setExpenses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, [authFetch]);

  if (loading) return <div>Loading expenses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>My Expenses</h2>
      <ul>
        {expenses.map(expense => (
          <li key={expense._id}>
            {expense.description}: ${expense.amount} ({expense.category})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Webhook Notifications

For third-party integrations, the API offers webhooks for real-time notifications about events:

### Available Events
- `expense.created`: Triggered when a new expense is created
- `expense.updated`: Triggered when an expense is updated
- `expense.deleted`: Triggered when an expense is deleted
- `settlement.created`: Triggered when a settlement is created
- `group.created`: Triggered when a group is created
- `group.updated`: Triggered when a group is updated
- `group.deleted`: Triggered when a group is deleted

### Webhook Registration
To register a webhook endpoint, contact the API administrators with:
1. The URL to receive webhook callbacks
2. The events you want to subscribe to
3. An optional secret key for webhook signature verification

### Webhook Payload
```json
{
  "event": "expense.created",
  "timestamp": "2025-05-15T12:30:00.000Z",
  "data": {
    // The resource data (expense, settlement, group, etc.)
  }
}
```

## Batch Operations

For efficiency, some operations support batch processing:

### Batch Expense Creation
- **POST /expenses/batch**
- Authentication: Required
- Request body:
```json
{
  "expenses": [
    {
      "description": "Restaurant",
      "amount": 100.50,
      "splitType": "equal",
      "paidBy": [{ "user": "userId", "amount": 100.50 }],
      "owedBy": [{ "user": "userId" }, { "user": "userId2" }],
      "date": "2025-05-15T12:00:00.000Z",
      "category": "Food"
    },
    {
      "description": "Taxi",
      "amount": 25.00,
      "splitType": "equal",
      "paidBy": [{ "user": "userId", "amount": 25.00 }],
      "owedBy": [{ "user": "userId" }, { "user": "userId2" }],
      "date": "2025-05-15T14:00:00.000Z",
      "category": "Transport"
    }
  ],
  "group": "groupId" // Optional, apply to all expenses in the batch
}
```
- Response (201 Created): Array of created expenses

---

**Important Notes:**
- All user/group IDs must be MongoDB ObjectId strings (24-character hexadecimal).
- For "Add Friend", use `{ "friendId": "userId" }` (not email).
- Always validate input data before sending to the API.
- Receipt images should be base64 encoded strings.
- The system automatically handles all balance calculations.
- Token expiration is set to 24 hours. After that, you'll need to login again.
- For all other routes, follow the controller and model requirements, not just the README.
