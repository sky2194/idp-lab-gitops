const express = require('express');
const http = require('http');
const url = require('url');
const app = express();

app.use(express.json());

const BACKEND_URL = process.env.BACKEND_URL || 'http://payment-service';

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PaymentOS - Secure Vault</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; display: flex; flex-direction: column; }
    header { background: #1a1d2e; border-bottom: 1px solid #2d3748; padding: 0 2rem; height: 60px; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; font-weight: 700; color: #fff; }
    .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .badge { background: #1e293b; border: 1px solid #334155; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; color: #94a3b8; }
    .main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .vault-card { background: #1a1d2e; border: 1px solid #2d3748; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 540px; }
    .vault-header { display: flex; align-items: center; gap: 12px; margin-bottom: 0.5rem; }
    .lock-icon { font-size: 2rem; }
    .vault-title { font-size: 1.4rem; font-weight: 700; color: #fff; }
    .vault-subtitle { color: #64748b; font-size: 0.85rem; margin-bottom: 2rem; padding-left: 3.5rem; }
    .route-indicator { display: flex; align-items: center; gap: 8px; background: #0f1117; border: 1px solid #2d3748; border-radius: 8px; padding: 10px 14px; margin-bottom: 1.5rem; font-size: 0.78rem; color: #64748b; font-family: monospace; }
    .svc { background: #1e293b; border: 1px solid #334155; padding: 2px 8px; border-radius: 4px; color: #a5b4fc; }
    .arrow { color: #6366f1; font-size: 1rem; }
    textarea { width: 100%; background: #0f1117; border: 1px solid #2d3748; border-radius: 10px; padding: 14px; color: #e2e8f0; font-size: 0.95rem; font-family: inherit; resize: none; height: 100px; outline: none; transition: border-color 0.2s; margin-bottom: 1rem; }
    textarea:focus { border-color: #6366f1; }
    textarea::placeholder { color: #475569; }
    .send-btn { width: 100%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 14px; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .send-btn:hover { opacity: 0.9; }
    .send-btn:active { transform: scale(0.99); }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .result { margin-top: 1.5rem; background: #0f1117; border: 1px solid #2d3748; border-radius: 10px; padding: 1.25rem; display: none; }
    .result.visible { display: block; animation: fadeIn 0.3s ease; }
    .result.error { border-color: #ef4444; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .result-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 0.85rem; }
    .result-row:last-child { border-bottom: none; }
    .result-label { color: #64748b; flex-shrink: 0; margin-right: 1rem; }
    .result-value { color: #e2e8f0; text-align: right; font-family: monospace; word-break: break-all; }
    .result-value.green { color: #10b981; }
    .result-value.purple { color: #a5b4fc; }
    .result-value.yellow { color: #f59e0b; }
    .success-badge { display: inline-flex; align-items: center; gap: 4px; background: #064e3b; color: #10b981; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem; }
    .error-msg { color: #ef4444; font-size: 0.875rem; }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <div class="logo-icon">💳</div>
      PaymentOS
    </div>
    <div class="badge">dev namespace • payment-ui</div>
  </header>
  <div class="main">
    <div class="vault-card">
      <div class="vault-header">
        <span class="lock-icon">🔐</span>
        <div class="vault-title">Secure Message Vault</div>
      </div>
      <div class="vault-subtitle">Type a message — watch it travel to the backend and come back encrypted</div>
      <div class="route-indicator">
        <span class="svc">payment-ui</span>
        <span class="arrow">→</span>
        <span class="svc">payment-service</span>
        <span style="margin-left: auto">Kubernetes DNS · dev namespace</span>
      </div>
      <textarea id="message" placeholder="Type your secret message here..." maxlength="200"></textarea>
      <button class="send-btn" id="sendBtn" onclick="encrypt()">
        🔒 Encrypt & Send to Backend
      </button>
      <div class="result" id="result"></div>
    </div>
  </div>
  <script>
    async function encrypt() {
      const message = document.getElementById('message').value.trim();
      if (!message) return;
      const btn = document.getElementById('sendBtn');
      const result = document.getElementById('result');
      btn.disabled = true;
      btn.innerHTML = '⏳ Sending to payment-service...';
      result.className = 'result';
      result.innerHTML = '';
      const start = Date.now();
      try {
        const res = await fetch('/api/encrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        const roundTrip = Date.now() - start;
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Backend error');
        result.className = 'result visible';
        result.innerHTML = \`
          <div class="success-badge">✅ Encrypted by payment-service</div>
          <div class="result-row"><span class="result-label">Encrypted</span><span class="result-value purple">\${data.encrypted}</span></div>
          <div class="result-row"><span class="result-label">Message ID</span><span class="result-value yellow">\${data.message_id}</span></div>
          <div class="result-row"><span class="result-label">Key ID</span><span class="result-value">\${data.key_id}</span></div>
          <div class="result-row"><span class="result-label">Algorithm</span><span class="result-value">\${data.algorithm}</span></div>
          <div class="result-row"><span class="result-label">Processed by</span><span class="result-value green">\${data.processed_by}</span></div>
          <div class="result-row"><span class="result-label">Namespace</span><span class="result-value">\${data.namespace}</span></div>
          <div class="result-row"><span class="result-label">Backend time</span><span class="result-value">\${data.processing_time_ms}ms</span></div>
          <div class="result-row"><span class="result-label">Round trip</span><span class="result-value green">\${roundTrip}ms</span></div>
          <div class="result-row"><span class="result-label">Timestamp</span><span class="result-value">\${data.timestamp}</span></div>
        \`;
      } catch(e) {
        result.className = 'result visible error';
        result.innerHTML = \`<div class="error-msg">❌ Failed to reach payment-service: \${e.message}</div>\`;
      }
      btn.disabled = false;
      btn.innerHTML = '🔒 Encrypt & Send to Backend';
    }
    document.getElementById('message').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && e.metaKey) encrypt();
    });
  </script>
</body>
</html>`);
});

app.post('/api/encrypt', (req, res) => {
  const backendUrl = url.parse(BACKEND_URL);
  const body = JSON.stringify(req.body);

  const options = {
    hostname: backendUrl.hostname,
    port: backendUrl.port || 80,
    path: '/api/encrypt',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    res.status(503).json({ error: 'Backend unavailable', message: e.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(8080, () => console.log('payment-ui running on port 8080'));
