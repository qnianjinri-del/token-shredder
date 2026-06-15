/* global console, fetch, process */

const endpoint = process.env.TOKEN_SHREDDER_URL || 'http://127.0.0.1:17391/usage';

if (typeof fetch !== 'function') {
  console.error('This example needs Node.js 18+ because it uses the built-in fetch API.');
  process.exit(1);
}

const payload = {
  source: 'node-example',
  scenarioName: 'Node example usage',
  inputTokens: 140_000,
  outputTokens: 52_000,
  cachedInputTokens: 25_000,
  reasoningTokens: 7_500,
  directCost: 0,
};

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const body = await response.text();

if (!response.ok) {
  console.error(`Token Shredder rejected the event: ${response.status}`);
  console.error(body);
  process.exit(1);
}

console.log(`Sent usage to ${endpoint}`);
console.log(body);
