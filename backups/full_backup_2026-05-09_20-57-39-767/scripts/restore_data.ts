import fs from 'fs';
import path from 'path';

const backupDir = 'backups/full_backup_2026-05-09_14-30-53-990/src/data';
const targetDir = 'src/data';

const files = fs.readdirSync(backupDir);

for (const file of files) {
  if (file.endsWith('.ts')) {
    const backupPath = path.join(backupDir, file);
    const targetPath = path.join(targetDir, file);
    fs.copyFileSync(backupPath, targetPath);
    console.log(`Restored ${file}`);
  }
}
