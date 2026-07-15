import http from 'k6/http';
import { check, sleep } from 'k6';

// Test Configuration
export const options = {
  // Simulates ramp-up of users
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 concurrent virtual users (VUs)
    { duration: '1m', target: 100 },  // Ramp up to 100 VUs
    { duration: '2m', target: 100 },  // Stay at 100 VUs (sustained peak load)
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    http_req_duration: ['p(95)<1000'], // 95% of requests should complete under 1s
  },
};

const BASE_URL = 'http://localhost:8080';

// Scenario lifecycle
export default function () {
  const payload = JSON.stringify({
    branchId: 1,
    paymentMethod: 'cash',
    amountTendered: 200,
    items: [
      {
        drinkId: 71, // Ensure this drink ID exists in your seeded DB
        quantity: 1,
        selections: []
      }
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${BASE_URL}/api/orders`, payload, params);

  if (response.status !== 200 && response.status !== 201) {
    console.warn(`Failed Request: Status ${response.status} - Body: ${response.body}`);
  }

  check(response, {
    'status is 200/201': (r) => r.status === 200 || r.status === 201,
    'has order ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });

  // Simulate thinking time between placing orders
  sleep(1); 
}
