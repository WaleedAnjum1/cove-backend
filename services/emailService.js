import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using SMTP transport with connection timeout settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // 5 seconds
  greetingTimeout: 5000,   // 5 seconds
  socketTimeout: 8000,     // 8 seconds
});

// Verify transporter connection
transporter.verify()
  .then(() => console.log('SMTP connection verified'))
  .catch(err => console.error('SMTP connection error:', err));

/**
 * Send contact form email
 * @param {Object} contactData - The contact form data
 * @param {string} contactData.name - Name of the sender
 * @param {string} contactData.email - Email of the sender
 * @param {string} contactData.phone - Phone number of the sender
 * @param {string} contactData.subject - Subject of the message
 * @param {string} contactData.message - Message content
 * @returns {Promise} - Email sending result
 */
export const sendContactEmail = async (contactData) => {
  const { name, email, phone, subject, message } = contactData;
  
  // Create a simplified HTML template to reduce processing time
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
        .header { background-color: #6BA0A7; padding: 15px; color: white; text-align: center; }
        .content { padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; }
        .footer { background-color: #f5f5f5; padding: 10px; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>COVE CHILDCARE - New Contact Form Submission</h2>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div>${name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div>${email}</div>
          </div>
          
          <div class="field">
            <div class="label">Phone:</div>
            <div>${phone}</div>
          </div>
          
          <div class="field">
            <div class="label">Subject:</div>
            <div>${subject}</div>
          </div>
          
          <div class="field">
            <div class="label">Message:</div>
            <div>${message}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This message was sent from the Cove Childcare website contact form</p>
          <p>To reply directly, email ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Email options
  const mailOptions = {
    from: `"${name} via Cove Childcare" <${process.env.EMAIL_USER}>`, // Use authenticated sender
    to: process.env.CONTACT_EMAIL || 'Contract@covechildcare.co.uk',
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Subject: ${subject}
      
      Message:
      ${message}
    `,
    html: htmlContent,
  };
  
  try {
    // Set timeout for email sending
    const emailPromise = transporter.sendMail(mailOptions);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timed out')), 8000); // 8 seconds timeout
    });
    
    // Race the promises
    const info = await Promise.race([emailPromise, timeoutPromise]);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 