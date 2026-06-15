/* global console, fetch, process */

const endpoint = process.env.TOKEN_SHREDDER_URL || 'http://127.0.0.1:17391/usage';

if (typeof fetch !== 'function') {
  console.error('This example needs Node.js 18+ because it uses the built-in fetch API.');
  process.exit(1);
}

const payload = {
  source: 'openai-style-example',
  scenarioName: 'OpenAI-style usage example',
  usage: {
    prompt_tokens: 180_000,
    completion_tokens: 64_000,
    prompt_tokens_details: {
      cached_tokens: 40_000,
    },
    completion_tokens_details: {
      reasoning_tokens: 9_000,
    },
  },
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

console.log(`Sent OpenAI-style usage to ${endpoint}`);
console.log(body);
