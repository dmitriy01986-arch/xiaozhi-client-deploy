import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Получаем MCP Endpoint из переменных окружения Railway
const mcpEndpoint = process.env.MCP_ENDPOINT;

if (!mcpEndpoint) {
  console.error('❌ Ошибка: MCP_ENDPOINT не задан!');
  console.error('Добавьте переменную MCP_ENDPOINT в настройках Railway');
  process.exit(1);
}

console.log(`✅ MCP Endpoint: ${mcpEndpoint}`);

// Функция для создания конфигурационного файла
function createConfig() {
  const configPath = path.join(__dirname, 'xiaozhi.config.json');
  const config = {
    mcpEndpoints: [mcpEndpoint],
    port: process.env.PORT || 8080,
    host: '0.0.0.0'
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Конфигурация создана');
}

// Функция для запуска xiaozhi-client
function startXiaozhi() {
  console.log('🚀 Запуск xiaozhi-client...');
  
  const client = exec('npx xiaozhi-client start', {
    cwd: __dirname,
    env: { ...process.env }
  });
  
  client.stdout.on('data', (data) => {
    console.log(`[xiaozhi] ${data}`);
  });
  
  client.stderr.on('data', (data) => {
    console.error(`[xiaozhi-error] ${data}`);
  });
  
  client.on('close', (code) => {
    console.log(`xiaozhi-client завершил работу с кодом ${code}`);
    // Перезапускаем через 5 секунд
    setTimeout(startXiaozhi, 5000);
  });
}

// Создаем конфигурацию и запускаем
createConfig();
startXiaozhi();

// Простой HTTP сервер для health check
const app = express();
const port = process.env.PORT || 8080;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'xiaozhi-client',
    mcpEndpoint: mcpEndpoint ? 'configured' : 'missing'
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Health check сервер на порту ${port}`);
});
