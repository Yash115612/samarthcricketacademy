
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';

const password = 'SamarthAdmin!@@';
const saltRounds = 12;
const outputFile = 'generated-hash.txt';

async function generateHash() {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const userId = randomUUID();
    const output = `
Password Hash: ${hash}

SQL INSERT Statement:
INSERT INTO users (id, email, name, role, branch_id, is_profile_complete, membership_status, password_hash)
VALUES (
  '${userId}', 
  'samarth@admin.com', 
  'Admin', 
  'admin', 
  'samarth', 
  true, 
  'active', 
  '${hash.replace(/'/g, "''")}'
);
    `.trim();
    await fs.writeFile(outputFile, output, 'utf8');
    console.log('Success! Output written to', outputFile);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();
