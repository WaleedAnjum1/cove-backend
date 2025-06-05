import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
  
  // HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Raleway', Arial, sans-serif;
          line-height: 1.6;
          color: #28293D;
          max-width: 650px;
          margin: 0 auto;
          background-color: #f9f9f9;
        }
        .container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.08);
          margin: 20px auto;
        }
        .header {
          background-color: #6BA0A7;
          padding: 25px;
          text-align: center;
          position: relative;
        }
        .logo-container {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          display: inline-block;
          margin-bottom: 15px;
        }
        .header h2 {
          color: white;
          margin: 0;
          font-weight: 800;
          font-size: 24px;
        }
        .content {
          background-color: white;
          padding: 30px;
        }
        .field {
          margin-bottom: 20px;
          border-left: 4px solid #DAAA52;
          padding-left: 15px;
        }
        .label {
          font-weight: 700;
          margin-bottom: 8px;
          color: #28293D;
          font-size: 16px;
        }
        .value {
          background-color: #f8f8f8;
          padding: 12px 15px;
          border-radius: 8px;
          color: #28293D;
          font-size: 15px;
          line-height: 1.5;
        }
        .message-value {
          white-space: pre-wrap;
        }
        .footer {
          background-color: #28293D;
          color: white;
          padding: 20px;
          text-align: center;
          font-size: 14px;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer a {
          color: #DAAA52;
          text-decoration: none;
        }
        .contact-info {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 13px;
        }
        .wave-top {
          display: block;
          width: 100%;
          height: 20px;
          background-color: white;
          border-radius: 12px 12px 0 0;
        }
        .wave-bottom {
          display: block;
          width: 100%;
          height: 20px;
          background-color: #28293D;
          border-radius: 0 0 12px 12px;
        }
        .accent-box {
          border-top: 3px solid #D99F9B;
          background-color: #FFF3F4;
          padding: 15px;
          margin: 25px 0 15px;
          border-radius: 8px;
          font-weight: 600;
        }
        .cove-title {
          color: white;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 1px;
          margin: 0 0 5px 0;
        }
        .cove-subtitle {
          color: white;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="cove-title">COVE</div>
          <div class="cove-subtitle">CHILDCARE</div>
          <h2>New Contact Form Submission</h2>
        </div>
        
        <div class="content">
          <div class="accent-box">
            You have received a new inquiry from the Cove Childcare website contact form.
          </div>
          
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>
          
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${phone}</div>
          </div>
          
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${subject}</div>
          </div>
          
          <div class="field">
            <div class="label">Message:</div>
            <div class="value message-value">${message}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This message was sent from the Cove Childcare website contact form</p>
          <p>To reply directly, email <a href="mailto:${email}">${email}</a></p>
          
          <div class="contact-info">
            <p>COVE Office, First Floor, Parkway Two, Manchester</p>
            <p>Phone: 078.265.38987 | Email: HR@covechildcare.co.uk</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Email options
  const mailOptions = {
    from: `"${name} via Cove Childcare" <${email}>`,
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
      
      (This message was sent from ${email})
    `,
    html: htmlContent,
  };
  
  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
  return info;
}; 