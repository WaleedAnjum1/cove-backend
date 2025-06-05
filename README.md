# Cove Childcare Backend Server

This is the backend server for the Cove Childcare website, handling contact form submissions and email notifications.

## Features

- RESTful API for contact form submissions
- Email notifications using Nodemailer
- MongoDB database for storing form submissions
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- SMTP email account (Gmail, etc.)

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Run the setup script (recommended):

```bash
npm run setup
```

This interactive script will:
- Guide you through configuration
- Create the `.env` file with your settings
- Install dependencies

### Manual Installation

If you prefer to set up manually:

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on the `env.example` template:

```bash
cp env.example .env
```

3. Update the `.env` file with your actual configuration values

## Configuration

The following environment variables need to be set in the `.env` file:

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `EMAIL_HOST`: SMTP server host (e.g., smtp.gmail.com)
- `EMAIL_PORT`: SMTP server port (e.g., 587)
- `EMAIL_SECURE`: Whether to use TLS (true/false)
- `EMAIL_USER`: SMTP username/email
- `EMAIL_PASS`: SMTP password or app password
- `CONTACT_EMAIL`: Recipient email for contact form submissions

## Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### POST /api/contact

Submits a contact form and sends an email notification.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "subject": "General Inquiry",
  "message": "Hello, I have a question about your services."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Thank you for your message. We will get back to you soon!"
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "ok"
}
```

## Deployment on Bluehost

1. Log in to your Bluehost cPanel
2. Navigate to "Software" > "Node.js"
3. Click "Create Application"
4. Set the application path to your domain (e.g., api.covechildcare.co.uk)
5. Choose Node.js version (14.x or higher)
6. Set the application root to the server directory
7. Set the application URL
8. Set the application startup file to `server.js`
9. Save and deploy

### Setting up MongoDB on Bluehost

1. Use MongoDB Atlas cloud service for production
2. Update your `.env` file with the MongoDB Atlas connection string

### Setting up Environment Variables on Bluehost

1. SSH into your Bluehost server
2. Navigate to your application directory
3. Create or edit the `.env` file with your production values

## Troubleshooting

- If emails are not being sent, check your SMTP credentials and firewall settings
- For MongoDB connection issues, verify your connection string and network access
- For deployment issues on Bluehost, check the Node.js application logs 