import { exec } from 'child_process';
import express from 'express';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 8080;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'xiaozhi-client' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Health check сервер на порту ${port}`);
});

// Проверяем наличие config файла
if (!fs.existsSync('./xiaozhi.config.json')) {
  console.error('❌ Файл xiaozhi.config.json не найден!');
  process.exit(1);
}

// Читаем конфиг
const config = JSON.parse(fs.readFileSync('./xiaozhi.config.json', 'utf8'));
console.log('✅ Конфигурация загружена, mcpEndpoint:', config.mcpEndpoint);

// Запускаем xiaozhi-client с явным указанием конфига
const client = exec('npx xiaozhi-client start --config xiaozhi.config.json');

client.stdout.on('data', (data) => {
  console.log(`[xiaozhi] ${data}`);
});

client.stderr.on('data', (data) => {
  console.error(`[xiaozhi-err] ${data}`);
});

client.on('close', (code) => {
  console.log(`xiaozhi-client завершил работу с кодом ${code}`);
  process.exit(code);
});
