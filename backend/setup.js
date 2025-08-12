/**
 * Medicare Backend Setup Script
 *
 * This script prepares the backend project by:
 * 1. Creating required directories
 * 2. Creating a sample .env file if missing
 * 3. Checking if MongoDB is installed
 * 4. Printing startup instructions
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required directories
const directories = [
  'config',
  'controllers',
  'middleware',
  'models',
  'routes',
  'utils',
  'uploads',
  'uploads/profiles',
];

console.log(chalk.blue('\n📁 Creating required directories...'));
directories.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(chalk.green(`✓ Created: ${dir}`));
  } else {
    console.log(chalk.yellow(`✓ Exists: ${dir}`));
  }
});

// .env file setup
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log(chalk.blue('\n⚙️  Creating sample .env file...'));
  const sampleEnv = `NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your_jwt_secret_change_this_in_production
JWT_EXPIRE=30d`;
  fs.writeFileSync(envPath, sampleEnv);
  console.log(chalk.green('✓ Sample .env created'));
  console.log(chalk.yellow('⚠️  Update .env with your actual credentials (e.g. MongoDB Atlas URI)'));
} else {
  console.log(chalk.green('\n✓ .env file already exists'));
}

// MongoDB check
console.log(chalk.blue('\n🔍 Checking MongoDB installation...'));
exec('mongod --version', (err) => {
  if (err) {
    console.log(chalk.red('✗ MongoDB not found in PATH'));
    console.log(chalk.yellow('➡️  Install MongoDB or connect via MongoDB Atlas'));
    console.log(chalk.yellow('🔗 https://www.mongodb.com/try/download/community'));
  } else {
    console.log(chalk.green('✓ MongoDB is installed'));
    console.log(chalk.yellow('ℹ️  Ensure MongoDB service is running before starting the server'));
  }

  // Startup instructions
  console.log(chalk.blue('\n🚀 Setup Complete! Next steps:'));
  console.log(chalk.white('1. Install dependencies:'));
  console.log(chalk.cyan('   npm install'));
  console.log(chalk.white('2. Start development server:'));
  console.log(chalk.cyan('   npm run dev'));
  console.log(chalk.white('\nOr for production:'));
  console.log(chalk.cyan('   npm start'));
  console.log(chalk.green('\n✅ Medicare backend is ready!'));
});
