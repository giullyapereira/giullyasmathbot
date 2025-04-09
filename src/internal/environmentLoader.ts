import * as fs from 'fs';
import * as path from 'path';

export function loadEnvironmentVariables() {
  try {
    // Path to the env/.env.local file
    const envPath = path.resolve(__dirname, '../../env/.env.local');
    console.log("Looking for env file at:", envPath);
    
    if (fs.existsSync(envPath)) {
      console.log("Found .env.local file, loading variables");
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Parse the file content and set environment variables
      envContent.split('\n').forEach(line => {
        // Skip empty lines and comments
        if (!line || line.startsWith('#')) return;
        
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
          console.log(`Set environment variable: ${key.trim()}`);
        }
      });
    } else {
      console.log(".env.local file not found");
    }
  } catch (error) {
    console.error("Error loading environment variables:", error);
  }
}