import fs from 'fs';
import readline from 'readline';
import { exec } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Cove Childcare Backend Setup ===');
console.log('This script will help you set up your backend server.');

// Check if .env file exists
if (fs.existsSync('.env')) {
  console.log('\n⚠️ .env file already exists. Do you want to overwrite it? (y/n)');
  rl.question('> ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      createEnvFile();
    } else {
      console.log('\n✅ Setup cancelled. Your existing .env file was preserved.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  console.log('\n📝 Please enter your configuration details:');
  
  rl.question('MongoDB URI (default: mongodb://localhost:27017/cove-childcare): ', (mongoUri) => {
    const MONGODB_URI = mongoUri || 'mongodb://localhost:27017/cove-childcare';
    
    rl.question('Email host (default: smtp.gmail.com): ', (emailHost) => {
      const EMAIL_HOST = emailHost || 'smtp.gmail.com';
      
      rl.question('Email port (default: 587): ', (emailPort) => {
        const EMAIL_PORT = emailPort || '587';
        
        rl.question('Email secure (true/false, default: false): ', (emailSecure) => {
          const EMAIL_SECURE = emailSecure || 'false';
          
          rl.question('Email user: ', (emailUser) => {
            if (!emailUser) {
              console.log('\n❌ Email user is required.');
              rl.close();
              return;
            }
            
            rl.question('Email password: ', (emailPass) => {
              if (!emailPass) {
                console.log('\n❌ Email password is required.');
                rl.close();
                return;
              }
              
              rl.question('Contact email (default: Contract@covechildcare.co.uk): ', (contactEmail) => {
                const CONTACT_EMAIL = contactEmail || 'Contract@covechildcare.co.uk';
                
                // Create .env file
                const envContent = `# Server Configuration
PORT=5000

# MongoDB Connection
MONGODB_URI=${MONGODB_URI}

# Email Configuration
EMAIL_HOST=${EMAIL_HOST}
EMAIL_PORT=${EMAIL_PORT}
EMAIL_SECURE=${EMAIL_SECURE}
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}
CONTACT_EMAIL=${CONTACT_EMAIL}`;
                
                fs.writeFileSync('.env', envContent);
                console.log('\n✅ .env file created successfully!');
                
                // Ask to install dependencies
                console.log('\nDo you want to install dependencies now? (y/n)');
                rl.question('> ', (answer) => {
                  if (answer.toLowerCase() === 'y') {
                    console.log('\n📦 Installing dependencies...');
                    exec('npm install', (error, stdout, stderr) => {
                      if (error) {
                        console.error(`\n❌ Error installing dependencies: ${error.message}`);
                        rl.close();
                        return;
                      }
                      console.log('\n✅ Dependencies installed successfully!');
                      console.log('\n🚀 You can now start the server with: npm run dev');
                      rl.close();
                    });
                  } else {
                    console.log('\n✅ Setup complete! Run "npm install" to install dependencies.');
                    rl.close();
                  }
                });
              });
            });
          });
        });
      });
    });
  });
} 