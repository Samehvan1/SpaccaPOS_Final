const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/orders/58/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminPin: '000000',
        returnToStockItems: [76]
      })
    });
    console.log('Status:', res.status);
    console.log('Response:', await res.json());
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
