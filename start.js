import { exec } from 'child_process';
import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'xiaozhi-client' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Health check сервер на порту ${port}`);
});

// Просто передаём MCP_ENDPOINT из переменных окружения
const mcpEndpoint = process.env.MCP_ENDPOINT;

if (!mcpEndpoint) {
  console.error('❌ MCP_ENDPOINT не задан в переменных окружения');
  process.exit(1);
}

console.log('✅ MCP Endpoint настроен');

// Запускаем xiaozhi-client с передачей endpoint через параметр
const client = exec(`npx xiaozhi-client start --mcp-endpoint "${mcpEndpoint}"`);

client.stdout.on('data', (data) => {
  console.log(`[xiaozhi] ${data}`);
});

client.stderr.on('data', (data) => {
  console.error(`[xiaozhi-err] ${data}`);
});

client.on('close', (code) => {
  console.log(`xiaozhi-client завершил работу с кодом ${code}`);
  // Не завершаем процесс, а перезапускаем
  setTimeout(() => {
    console.log('🔄 Перезапуск...');
    const newClient = exec(`npx xiaozhi-client start --mcp-endpoint "${mcpEndpoint}"`);
    // ... перенаправляем вывод
  }, 5000);
});
