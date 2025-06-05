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

// MongoDB connection promise - reuse connection between function invocations
let cachedConnection = null;

// Connect to MongoDB
const connectDB = async () => {
  // If we already have a connection, use it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // Set connection options with shorter timeouts
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 seconds (reduced from default)
    socketTimeoutMS: 10000, // 10 seconds (reduced from default)
    connectTimeoutMS: 5000, // 5 seconds
  };

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
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
    
    // Process in parallel to save time
    const promises = [];
    
    // Connect to database first (to establish connection early)
    try {
      await connectDB();
      
      // Add database save to promises
      const contact = new Contact({ name, email, phone, subject, message });
      promises.push(contact.save().catch(dbError => {
        console.error('Error saving to database:', dbError);
        // Don't fail the whole function if DB save fails
        return null;
      }));
    } catch (dbConnError) {
      console.error('Database connection failed:', dbConnError);
      // Continue with email if DB connection fails
    }
    
    // Add email sending to promises
    promises.push(sendContactEmail({ name, email, phone, subject, message }).catch(emailError => {
      console.error('Error sending email:', emailError);
      throw emailError; // We do want to fail if email fails
    }));
    
    // Wait for all promises to resolve
    await Promise.all(promises);
    
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