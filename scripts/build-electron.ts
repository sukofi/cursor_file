// scripts/build-electron.ts
import { build } from 'vite';
import type { BuildOptions } from 'vite';
import { rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Electronビルド用の共通ビルドオプションをここで直接定義
const commonElectronBuildOptions: Omit<BuildOptions, 'lib'> & { lib: Omit<BuildOptions['lib'], 'entry' | 'fileName'> } = {
  lib: {
    formats: ['cjs'],
  },
  outDir: 'dist-electron',
  emptyOutDir: false,
  rollupOptions: {
    external: ['electron', 'active-win', 'node:url', 'path', 'child_process', 'util', 'better-sqlite3'],
  },
  build: {
    outDir: 'dist-electron',
    emptyOutDir: false,
  },
};

// 既存のdist-electronディレクトリを削除
rmSync('dist-electron', { recursive: true, force: true });

// dist-electronディレクトリを作成
import { mkdirSync } from 'node:fs';
try {
  mkdirSync('dist-electron', { recursive: true });
} catch (error) {
  // ディレクトリが既に存在する場合は無視
}

// TypeScriptコンパイラーを使用してビルド
import { execSync } from 'node:child_process';

// main.tsのビルド
console.log('main.tsをビルド中...');
const mainEntry = resolve(__dirname, '../electron/main.ts');
console.log('main.tsのエントリーポイント:', mainEntry);

try {
  execSync(`npx tsc ${mainEntry} --outDir dist-electron --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck --noEmitOnError`, { stdio: 'inherit' });
  console.log('✅ main.tsのビルド完了');
} catch (error) {
  console.error('❌ main.tsのビルドエラー:', error);
}

// preload.tsのビルド
console.log('preload.tsをビルド中...');
const preloadEntry = resolve(__dirname, '../electron/preload.ts');
console.log('preload.tsのエントリーポイント:', preloadEntry);

try {
  execSync(`npx tsc ${preloadEntry} --outDir dist-electron --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck --noEmitOnError`, { stdio: 'inherit' });
  console.log('✅ preload.tsのビルド完了');
} catch (error) {
  console.error('❌ preload.tsのビルドエラー:', error);
}

// database.tsのビルド
console.log('database.tsをビルド中...');
const databaseEntry = resolve(__dirname, '../electron/database.ts');
console.log('database.tsのエントリーポイント:', databaseEntry);

try {
  execSync(`npx tsc ${databaseEntry} --outDir dist-electron --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck --noEmitOnError`, { stdio: 'inherit' });
  console.log('✅ database.tsのビルド完了');
} catch (error) {
  console.error('❌ database.tsのビルドエラー:', error);
}

// ファイル名を.cjsに変更
try {
  execSync('mv dist-electron/electron/main.js dist-electron/main.cjs', { stdio: 'inherit' });
  execSync('mv dist-electron/preload.js dist-electron/preload.cjs', { stdio: 'inherit' });
  execSync('mv dist-electron/electron/database.js dist-electron/database.cjs', { stdio: 'inherit' });
  console.log('✅ ファイル名変更完了');
} catch (error) {
  console.error('❌ ファイル名変更エラー:', error);
}

// main.cjsのimport文を修正
try {
  const fs = await import('fs');
  const path = await import('path');
  const mainCjsPath = path.join(__dirname, '../dist-electron/main.cjs');
  let content = fs.readFileSync(mainCjsPath, 'utf8');
  content = content.replace(/require\("\.\/database"\)/g, 'require("./database.cjs")');
  fs.writeFileSync(mainCjsPath, content);
  console.log('✅ main.cjsのimport文を修正しました');
} catch (error) {
  console.error('❌ import文修正エラー:', error);
}

// 不要なディレクトリをクリーンアップ
try {
  execSync('rm -rf dist-electron/electron dist-electron/src', { stdio: 'inherit' });
  console.log('✅ 不要なディレクトリをクリーンアップしました');
} catch (error) {
  console.error('❌ クリーンアップエラー:', error);
}

console.log('✅ Electronビルドが完了しました');
console.log('dist-electronディレクトリの内容を確認してください');
