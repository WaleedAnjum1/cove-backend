import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { sendContactEmail } from './services/emailService.js';
import Contact from './models/Contact.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't exit the process, let the server continue running
  }
};

// Call the connect function
connectDB();

// Routes
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
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
    
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your message. We will get back to you soon!' 
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request. Please try again later.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 