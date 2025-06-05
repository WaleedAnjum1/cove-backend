import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendContactEmail } from '../../services/emailService.js';
import { getCorsHeaders } from './cors-helper.js';

// Load environment variables
dotenv.config();

// Define Contact schema directly in this file
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create model only if it doesn't exist
let Contact;
try {
  Contact = mongoose.model('Contact');
} catch {
  Contact = mongoose.model('Contact', contactSchema);
}

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB Connected');
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      throw error;
    }
  }
};

export const handler = async (event, context) => {
  // Make the function use connection reuse
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Get CORS headers based on the request origin
  const headers = getCorsHeaders(event.headers.origin || event.headers.Origin);
  
  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  // Only process POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { name, email, phone, subject, message } = body;
    
    // Validate input
    if (!name || !email || !phone || !subject || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'All fields are required' })
      };
    }
    
    // Connect to database
    await connectDB();
    
    // Try to save to database, but continue even if it fails
    try {
      const contact = new Contact({ name, email, phone, subject, message });
      await contact.save();
      console.log('Contact form data saved to database');
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue with email send even if database save fails
    }
    
    // Send email
    await sendContactEmail({ name, email, phone, subject, message });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Thank you for your message. We will get back to you soon!' 
      })
    };
  } catch (error) {
    console.error('Error processing contact form:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'An error occurred while processing your request. Please try again later.' 
      })
    };
  }
}; 