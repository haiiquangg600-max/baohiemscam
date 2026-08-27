import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import db, { initDatabase } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

await initDatabase();

const username = process.env.ADMIN_USERNAME || 'adminbhsc';
const password = process.env.ADMIN_PASSWORD || 'phanhaiquang';
const hash = bcrypt.hashSync(password, 12);

const existing = await db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
if (!existing) {
  await db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log('Admin created: ' + username);
} else {
  await db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(hash, username);
  console.log('Admin password updated: ' + username);
}

const traderCount = await db.prepare('SELECT COUNT(*)::int as c FROM traders').get();
const count = traderCount?.c ?? 0;
if (count === 0) {
  const demo = [
    { name: 'Trần Lượng', phone: '0901234567', facebook_url: 'https://facebook.com/demo1', deposit_amount: 5000000 },
    { name: 'Bùi Ngọc Minh', phone: '0912345678', facebook_url: 'https://facebook.com/demo2', deposit_amount: 10000000 },
    { name: 'Nguyễn Lưu Thịnh', phone: '0923456789', facebook_url: 'https://facebook.com/demo3', deposit_amount: 3000000 },
  ];
  for (let i = 0; i < demo.length; i++) {
    const t = demo[i];
    await db
      .prepare(
        `INSERT INTO traders (display_number, name, phone, facebook_url, deposit_amount, status)
         VALUES (?, ?, ?, ?, ?, 'active')`
      )
      .run(i + 1, t.name, t.phone, t.facebook_url, t.deposit_amount);
  }
  console.log('Seeded ' + demo.length + ' demo traders');
} else {
  console.log('Traders already exist, skip seed');
}

console.log('---');
console.log('Login: ' + username + ' / ' + password);
console.log('Seed completed');
process.exit(0);
