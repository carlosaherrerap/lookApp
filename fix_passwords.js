const bcrypt = require('bcrypt');
const { execSync } = require('child_process');

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  console.log('Hash generado:', hash);
  
  const sql = `UPDATE users SET password_hash='${hash}' WHERE email IN ('worker@mapx.com', 'admin@mapx.com');`;
  console.log('SQL:', sql);
  
  const cmd = `docker exec lookapp-db-1 psql -U androidApp -d lookApp -c "${sql}"`;
  const result = execSync(cmd, { encoding: 'utf8' });
  console.log('Resultado:', result);
}

main().catch(console.error);
