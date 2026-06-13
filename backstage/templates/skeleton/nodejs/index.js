const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({
    service: '${{ values.serviceName }}',
    team: '${{ values.team }}',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(8080, () => {
  console.log('${{ values.serviceName }} running on port 8080');
});
