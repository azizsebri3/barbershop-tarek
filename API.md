# 📡 API Documentation

## Bookings API

### Base URL
```
http://localhost:3000/api/bookings
https://your-deployed-site.com/api/bookings
```

## Endpoints

### 1. Create Booking
**POST** `/api/bookings`

Creates a new booking in the database.

#### Request Body
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+33 1 23 45 67 89",
  "date": "2025-01-15",
  "time": "14:00",
  "service": "consultation",
  "message": "Optional message"
}
```

#### Response (Success - 201)
```json
{
  "message": "Réservation créée avec succès",
  "booking": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33 1 23 45 67 89",
    "date": "2025-01-15",
    "time": "14:00",
    "service": "consultation",
    "message": "Optional message",
    "status": "pending",
    "created_at": "2025-01-10T14:30:00Z"
  }
}
```

#### Response (Error - 400)
```json
{
  "error": "Tous les champs requis doivent être remplis"
}
```

#### Required Fields
- ✅ name (string)
- ✅ email (string, valid email)
- ✅ phone (string)
- ✅ date (string, YYYY-MM-DD)
- ✅ time (string, HH:MM)
- ✅ service (string, service ID)
- ❌ message (optional)

#### CURL Example
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33 1 23 45 67 89",
    "date": "2025-01-15",
    "time": "14:00",
    "service": "consultation"
  }'
```

---

### 2. Get All Bookings
**GET** `/api/bookings`

Retrieves all bookings from the database (latest 50).

#### Response (200)
```json
{
  "bookings": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "phone": "+33 1 23 45 67 89",
      "date": "2025-01-15",
      "time": "14:00",
      "service": "consultation",
      "status": "pending",
      "created_at": "2025-01-10T14:30:00Z"
    }
    // ... more bookings
  ]
}
```

#### CURL Example
```bash
curl http://localhost:3000/api/bookings
```

---

### 3. Get Single Booking
**GET** `/api/bookings/[id]`

Retrieves a specific booking by ID.

#### Parameters
- `id` (string, UUID) - Booking ID

#### Response (200)
```json
{
  "booking": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33 1 23 45 67 89",
    "date": "2025-01-15",
    "time": "14:00",
    "service": "consultation",
    "status": "pending",
    "created_at": "2025-01-10T14:30:00Z"
  }
}
```

#### Response (Error - 404)
```json
{
  "error": "Réservation non trouvée"
}
```

#### CURL Example
```bash
curl http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440000
```

---

### 4. Update Booking Status
**PUT** `/api/bookings/[id]`

Updates the status of a booking.

#### Parameters
- `id` (string, UUID) - Booking ID

#### Request Body
```json
{
  "status": "confirmed"
}
```

#### Valid Status Values
- `pending` - Initial status
- `confirmed` - Confirmed by admin
- `cancelled` - Cancelled

#### Response (200)
```json
{
  "booking": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jean Dupont",
    "status": "confirmed",
    "updated_at": "2025-01-10T14:35:00Z"
  }
}
```

#### CURL Example
```bash
curl -X PUT http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

### 5. Delete Booking
**DELETE** `/api/bookings/[id]`

Deletes a booking from the database.

#### Parameters
- `id` (string, UUID) - Booking ID

#### Response (200)
```json
{
  "message": "Réservation supprimée avec succès"
}
```

#### CURL Example
```bash
curl -X DELETE http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440000
```

---

## Error Handling

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Tous les champs requis doivent être remplis | Missing required fields |
| 404 | Réservation non trouvée | Booking ID doesn't exist |
| 500 | Une erreur serveur s'est produite | Server error |

### Error Response Format
```json
{
  "error": "Error description"
}
```

---

## Usage Examples

### JavaScript/Fetch API

```javascript
// Create booking
async function createBooking(bookingData) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return await response.json();
}

// Usage
try {
  const booking = await createBooking({
    name: 'Jean Dupont',
    email: 'jean@example.com',
    phone: '+33 1 23 45 67 89',
    date: '2025-01-15',
    time: '14:00',
    service: 'consultation'
  });
  console.log('Booking created:', booking);
} catch (error) {
  console.error('Error:', error.message);
}
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const response = await fetch('/api/bookings');
        const data = await response.json();
        setBookings(data.bookings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching bookings');
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  return { bookings, loading, error };
}
```

---

## Testing the API

### Using Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Import the endpoints above
3. Test with sample data

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create requests for each endpoint
3. Test with JSON payloads

### Using VS Code REST Client
Create a file `requests.rest`:
```
### Create Booking
POST http://localhost:3000/api/bookings
Content-Type: application/json

{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+33 1 23 45 67 89",
  "date": "2025-01-15",
  "time": "14:00",
  "service": "consultation"
}

### Get All Bookings
GET http://localhost:3000/api/bookings

### Get Single Booking
GET http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440000

### Update Booking
PUT http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "status": "confirmed"
}

### Delete Booking
DELETE http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440000
```

Then click "Send Request" above each request.

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production:

1. Use a library like `express-rate-limit`
2. Implement at API level
3. Use Vercel's built-in rate limiting

Example (if implemented):
```
- Max 10 requests per minute per IP
- Max 100 requests per hour per IP
```

---

## Authentication (Future)

For a production admin panel:

```typescript
// Add to .env.local
ADMIN_SECRET_KEY=your-secret-key

// Add to API route
if (request.headers.get('x-admin-key') !== process.env.ADMIN_SECRET_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## CORS

Currently, the API is open to all origins. For production:

Add to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
      ],
    },
  ];
}
```

---

## Performance Tips

1. **Index frequently queried fields** (already done for date, email, status)
2. **Limit query results** (currently limits to 50)
3. **Use pagination** for large datasets
4. **Cache responses** using HTTP caching headers
5. **Monitor API usage** in Supabase dashboard

---

## Support

For API issues:
1. Check response status codes and error messages
2. Verify `.env.local` has correct Supabase credentials
3. Check Supabase dashboard for database status
4. Look at Next.js server logs
5. Test with curl or Postman first

---

Last Updated: December 2025
