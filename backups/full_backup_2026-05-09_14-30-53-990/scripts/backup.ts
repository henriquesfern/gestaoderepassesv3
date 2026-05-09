import * as fs from 'fs';
import * as path from 'path';

function copyDirectory(src: string, dest: string, ignoreList: string[] = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoreList.includes(entry.name)) {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, ignoreList);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function runBackup() {
  const rootDir = process.cwd();
  const backupsDir = path.join(rootDir, 'backups');
  const ignoreList = ['node_modules', 'dist', 'backups', '.git'];

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
  const destDir = path.join(backupsDir, `full_backup_${timestamp}`);

  try {
    console.log(`Iniciando backup crítico (Nível 4)...`);
    console.log(`Copiando todo o projeto de: ${rootDir}`);
    console.log(`Para: ${destDir}`);
    console.log(`Ignorando: ${ignoreList.join(', ')}`);
    
    copyDirectory(rootDir, destDir, ignoreList);
    
    console.log(`✅ Backup completo concluído com sucesso em: ${destDir}`);
  } catch (error) {
    console.error(`❌ Erro ao realizar backup:`, error);
    process.exit(1);
  }
}

runBackup();
