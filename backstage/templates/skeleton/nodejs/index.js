const express = require('express');
const path = require('path');
const app = express();

// In Kubernetes, payment-service is reachable via its service name
const BACKEND_URL = process.env.BACKEND_URL || 'http://payment-service';

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
    }

    header {
      background: #1a1d2e;
      border-bottom: 1px solid #2d3748;
      padding: 0 2rem;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .badge {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .subtitle {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #1a1d2e;
      border: 1px solid #2d3748;
      border-radius: 12px;
      padding: 1.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
    }

    .stat-value.green { color: #10b981; }
    .stat-value.yellow { color: #f59e0b; }
    .stat-value.red { color: #ef4444; }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
    }

    .refresh-btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .refresh-btn:hover { background: #4f46e5; }

    .table-wrapper {
      background: #1a1d2e;
      border: 1px solid #2d3748;
      border-radius: 12px;
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #0f1117;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      font-weight: 500;
    }

    td {
      padding: 0.875rem 1rem;
      border-top: 1px solid #2d3748;
      font-size: 0.875rem;
    }

    tr:hover td { background: #1e293b; }

    .merchant { font-weight: 500; color: #fff; }
    .category { color: #94a3b8; font-size: 0.8rem; }

    .amount { font-weight: 600; font-family: monospace; }
    .amount.debit { color: #ef4444; }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status.completed { background: #064e3b; color: #10b981; }
    .status.pending { background: #451a03; color: #f59e0b; }
    .status.failed { background: #450a0a; color: #ef4444; }

    .card-number { color: #64748b; font-family: monospace; font-size: 0.8rem; }
    .date { color: #64748b; font-size: 0.8rem; }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    .error {
      text-align: center;
      padding: 2rem;
      color: #ef4444;
      background: #450a0a22;
      border-radius: 8px;
      margin: 1rem;
    }
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

  <div class="container">
    <h1>Transaction Dashboard</h1>
    <p class="subtitle">Live data from payment-service backend</p>

    <div class="stats-grid" id="stats">
      <div class="stat-card">
        <div class="stat-label">Total Spent</div>
        <div class="stat-value green" id="total-spent">Loading...</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Transactions</div>
        <div class="stat-value" id="total-count">--</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending</div>
        <div class="stat-value yellow" id="pending-count">--</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Failed</div>
        <div class="stat-value red" id="failed-count">--</div>
      </div>
    </div>

    <div class="section-header">
      <div class="section-title">Recent Transactions</div>
      <button class="refresh-btn" onclick="loadData()">↻ Refresh</button>
    </div>

    <div class="table-wrapper">
      <div class="loading" id="loading">Loading transactions...</div>
      <div class="error" id="error" style="display:none"></div>
      <table id="txn-table" style="display:none">
        <thead>
          <tr>
            <th>ID</th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Card</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody id="txn-body"></tbody>
      </table>
    </div>
  </div>

  <script>
    async function loadSummary() {
      const res = await fetch('/api/summary');
      const data = await res.json();
      document.getElementById('total-spent').textContent = '$' + data.total_spent.toLocaleString();
      document.getElementById('total-count').textContent = data.transaction_count;
      document.getElementById('pending-count').textContent = data.pending_count;
      document.getElementById('failed-count').textContent = data.failed_count;
    }

    async function loadTransactions() {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      const tbody = document.getElementById('txn-body');
      tbody.innerHTML = data.transactions.map(t => \`
        <tr>
          <td><span class="card-number">\${t.id}</span></td>
          <td>
            <div class="merchant">\${t.merchant}</div>
            <div class="category">\${t.category}</div>
          </td>
          <td><span class="amount debit">-$\${t.amount.toFixed(2)}</span></td>
          <td><span class="status \${t.status}">\${t.status}</span></td>
          <td><span class="card-number">\${t.card}</span></td>
          <td><span class="date">\${t.date}</span></td>
        </tr>
      \`).join('');
    }

    async function loadData() {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('txn-table').style.display = 'none';
      document.getElementById('error').style.display = 'none';
      try {
        await Promise.all([loadSummary(), loadTransactions()]);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('txn-table').style.display = 'table';
      } catch(e) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'Failed to connect to payment-service backend: ' + e.message;
      }
    }

    loadData();
  </script>
</body>
</html>`);
});

// Proxy API calls to payment-service backend
const http = require('http');
const url = require('url');

app.get('/api/*', (req, res) => {
  const backendPath = req.path;
  const backendUrl = url.parse(BACKEND_URL);

  const options = {
    hostname: backendUrl.hostname,
    port: backendUrl.port || 80,
    path: backendPath,
    method: 'GET'
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    res.status(503).json({ error: 'Backend unavailable', message: e.message });
  });

  proxyReq.end();
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(8080, () => console.log('payment-ui running on port 8080'));
