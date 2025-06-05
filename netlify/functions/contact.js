import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendContactEmail } from '../../services/emailService.js';
import { getCorsHeaders } from './cors-helper.js';

// Load environment variables
dotenv.config();

// Log the MongoDB URI (with password masked)
const logMongoURI = () => {
  const uri = process.env.MONGODB_URI || '';
  if (uri) {
    // Mask the password in the URI for logging
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log('MongoDB URI:', maskedUri);
  } else {
    console.log('MongoDB URI is not defined');
  }
};

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
  // Log the MongoDB URI for debugging
  logMongoURI();
  
  // If we already have a connection, use it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }

  // Set connection options with shorter timeouts
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 10000, // 10 seconds
  };

  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error details:', error);
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
    
    // Connect to database first with proper error handling
    let dbSuccess = false;
    let dbError = null;
    
    try {
      // Connect to MongoDB
      await connectDB();
      
      // Create and save the contact document
      console.log('Creating contact document:', { name, email, phone, subject });
      const contact = new Contact({ name, email, phone, subject, message });
      const savedContact = await contact.save();
      console.log('Contact saved successfully:', savedContact._id);
      dbSuccess = true;
    } catch (err) {
      dbError = err;
      console.error('Error saving contact to database:', err);
    }
    
    // Send email regardless of database success
    try {
      await sendContactEmail({ name, email, phone, subject, message });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      
      // If both DB and email failed, throw the error
      if (!dbSuccess) {
        throw emailError;
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Thank you for your message. We will get back to you soon!',
      })
    };
  } catch (error) {
    console.error('Error processing contact form:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'An error occurred while processing your request. Please try again later.',
        error: error.message
      })
    };
  }
}; 