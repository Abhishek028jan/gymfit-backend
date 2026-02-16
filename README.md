# RedForce Gym - Backend API

RESTful API for RedForce Gym website built with Node.js, Express, and MySQL.

## Features

- ✅ RESTful API architecture
- ✅ MySQL database integration
- ✅ CRUD operations for all resources
- ✅ Input validation
- ✅ Error handling
- ✅ CORS enabled
- ✅ Environment variables configuration

## Tech Stack

- Node.js
- Express.js
- MySQL 2
- CORS
- dotenv
- body-parser

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` file and update with your MySQL credentials
   - Update `DB_PASSWORD` with your MySQL password

3. Create database:
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source database/schema.sql
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on [http://localhost:5000](http://localhost:5000)

## API Endpoints

### Programs

- `GET /api/programs` - Get all programs
- `GET /api/programs/:id` - Get single program
- `POST /api/programs` - Create new program
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

**Example Request Body (POST/PUT):**
```json
{
  "name": "Cardio Blast",
  "description": "High energy cardio workouts",
  "icon": "fire",
  "featured": true
}
```

### Trainers

- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get single trainer
- `POST /api/trainers` - Create new trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer

**Example Request Body (POST/PUT):**
```json
{
  "name": "Sarah Johnson",
  "specialty": "Pilates Coach",
  "bio": "Expert in pilates and core strengthening",
  "image": "https://example.com/sarah.jpg"
}
```

### Pricing Plans

- `GET /api/pricing` - Get all pricing plans with features
- `GET /api/pricing/:id` - Get single pricing plan
- `POST /api/pricing` - Create new pricing plan
- `PUT /api/pricing/:id` - Update pricing plan
- `DELETE /api/pricing/:id` - Delete pricing plan

**Example Request Body (POST/PUT):**
```json
{
  "name": "Premium",
  "price": 79,
  "period": "month",
  "popular": false,
  "features": [
    "VIP Access",
    "Personal Trainer",
    "Nutrition Plan",
    "Spa Access"
  ]
}
```

### Contact Messages

- `GET /api/contact` - Get all contact messages (admin)
- `GET /api/contact/:id` - Get single message
- `POST /api/contact` - Submit contact form
- `PATCH /api/contact/:id/read` - Mark message as read
- `DELETE /api/contact/:id` - Delete message

**Example Request Body (POST):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in joining the gym"
}
```

## Database Schema

### Tables

1. **programs**
   - id (INT, PRIMARY KEY)
   - name (VARCHAR)
   - description (TEXT)
   - icon (VARCHAR)
   - featured (BOOLEAN)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **trainers**
   - id (INT, PRIMARY KEY)
   - name (VARCHAR)
   - specialty (VARCHAR)
   - bio (TEXT)
   - image (VARCHAR)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. **pricing_plans**
   - id (INT, PRIMARY KEY)
   - name (VARCHAR)
   - price (DECIMAL)
   - period (VARCHAR)
   - popular (BOOLEAN)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. **plan_features**
   - id (INT, PRIMARY KEY)
   - plan_id (INT, FOREIGN KEY)
   - feature (VARCHAR)

5. **contact_messages**
   - id (INT, PRIMARY KEY)
   - name (VARCHAR)
   - email (VARCHAR)
   - message (TEXT)
   - is_read (BOOLEAN)
   - created_at (TIMESTAMP)

## Environment Variables

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=redforce_gym
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## CORS Configuration

CORS is enabled for all origins. In production, you should restrict this to your frontend domain.

## Sample Data

The schema.sql file includes sample data for:
- 3 Programs (Strength Training, Fat Burn, Yoga & Mobility)
- 3 Trainers (Alex, Maria, John)
- 3 Pricing Plans (Basic $19, Pro $39, Elite $59)
- Features for each pricing plan

## Testing the API

You can test the API using:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Browser (for GET requests)

Example cURL request:
```bash
curl http://localhost:5000/api/programs
```

## Future Enhancements

- [ ] Authentication & Authorization (JWT)
- [ ] User registration and login
- [ ] Membership management
- [ ] Class scheduling
- [ ] Payment integration
- [ ] File upload for trainer images
- [ ] Email notifications
- [ ] Admin dashboard
