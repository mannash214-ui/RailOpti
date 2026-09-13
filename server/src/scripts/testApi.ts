import http from 'http';

const postData = JSON.stringify({
  sourceStation: 'Silchar',
  destinationStation: 'Patna',
  travelDate: '2026-09-13',
  departureAfter: '08:00',
  optimizationMode: 'BALANCED'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/journeys/search',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status with today date:', res.statusCode);
    console.log('Response body:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(postData);
req.end();
