/**
 * Medicare Backend Starter Script
 *
 * - Checks for .env and node_modules
 * - Installs dependencies if missing
 * - Runs server in dev or production mode
 * - Provides frontend connection guide
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();

// Check for .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log(chalk.red('✗ .env file not found.'));
  console.log(chalk.yellow('→ Run the setup script first:'));
  console.log(chalk.cyan('   node setup.js'));
  process.exit(1);
}

// Check for node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log(chalk.yellow('\n📦 node_modules not found. Installing dependencies...'));
  
  const install = spawn('npm', ['install'], { stdio: 'inherit' });

  install.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.red('✗ Failed to install dependencies. Try running: npm install'));
      process.exit(1);
    }
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log(chalk.blue('\n🚀 Starting Medicare backend server...'));

  const isDev = process.env.NODE_ENV !== 'production';
  const command = isDev ? 'dev' : 'start';

  const server = spawn('npm', ['run', command], { stdio: 'inherit' });

  server.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.red(`✗ Server exited with code ${code}`));
      process.exit(code);
    }
  });

  // Show frontend connection guide
  const port = process.env.PORT || 5001;
  console.log(chalk.green('\n✅ Server is starting...'));
  console.log(chalk.yellow('\n🔗 To connect your frontend to this backend:'));
  console.log(chalk.white(`1. Make sure your frontend API base URL is:`));
  console.log(chalk.cyan(`   http://localhost:${port}/api`));
  console.log(chalk.white(`2. Example API call:`));
  console.log(chalk.cyan(`
   fetch('http://localhost:${port}/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   })
  `));
  console.log(chalk.yellow('\n💡 Press Ctrl+C to stop the server.\n'));
}
