export interface IntegrationExampleOptions {
  usageUrl: string;
  proxyBaseUrl: string;
  model: string;
}

const fallbackUsageUrl = 'http://127.0.0.1:17391/usage';
const fallbackProxyBaseUrl = 'http://127.0.0.1:17391/v1';

const normalizeUrl = (value: string, fallback: string) => {
  const trimmed = value.trim();
  return trimmed || fallback;
};

const normalizeModel = (model: string) => model.trim() || '你的模型或接入点 ID';

export const createCurlUsageExample = (usageUrl: string) => `curl -X POST ${normalizeUrl(usageUrl, fallbackUsageUrl)} \\
  -H "Content-Type: application/json" \\
  -d '{"source":"my-agent","scenarioName":"first real shred","inputTokens":120000,"outputTokens":45000,"cachedInputTokens":30000,"reasoningTokens":8000}'`;

export const createJsUsageExample = (usageUrl: string) => `await fetch("${normalizeUrl(usageUrl, fallbackUsageUrl)}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    source: "my-agent",
    scenarioName: "first real shred",
    inputTokens: 120000,
    outputTokens: 45000,
    cachedInputTokens: 30000,
    reasoningTokens: 8000
  })
});`;

export const createPythonUsageExample = (usageUrl: string) => `import requests

requests.post("${normalizeUrl(usageUrl, fallbackUsageUrl)}", json={
    "source": "my-python-agent",
    "scenarioName": "first real shred",
    "inputTokens": 120000,
    "outputTokens": 45000,
    "cachedInputTokens": 30000,
    "reasoningTokens": 8000,
})`;

export const createOpenAiSdkProxyExample = ({
  proxyBaseUrl,
  model,
}: Pick<IntegrationExampleOptions, 'proxyBaseUrl' | 'model'>) => `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "token-shredder-local",
  baseURL: "${normalizeUrl(proxyBaseUrl, fallbackProxyBaseUrl)}"
});

const response = await client.chat.completions.create({
  model: "${normalizeModel(model)}",
  messages: [{ role: "user", content: "hello" }]
});

console.log(response.choices[0]?.message?.content);`;

export const createAgentInstructionExample = ({
  usageUrl,
  proxyBaseUrl,
  model,
}: IntegrationExampleOptions) => `你正在接入 Token Shredder。请优先选择一种方式：

方式 A：如果你能拿到 token usage，请在每次任务结束后 POST 到：
${normalizeUrl(usageUrl, fallbackUsageUrl)}

JSON 字段：
- source: 你的工具名
- scenarioName: 当前任务名
- inputTokens: 普通输入 token
- outputTokens: 输出 token
- cachedInputTokens: cached input token，没有则填 0
- reasoningTokens: reasoning token，没有则填 0
- directCost: 可选，已有直接成本时填写

方式 B：如果你使用 OpenAI-compatible SDK，请把 baseURL 改成：
${normalizeUrl(proxyBaseUrl, fallbackProxyBaseUrl)}

模型 / 接入点 ID：
${normalizeModel(model)}

不要把 prompt、completion、messages 或 API key 写入 Token Shredder 的 usage 日志。`;

export const createIntegrationExamples = (options: IntegrationExampleOptions) => ({
  curlUsage: createCurlUsageExample(options.usageUrl),
  jsUsage: createJsUsageExample(options.usageUrl),
  pythonUsage: createPythonUsageExample(options.usageUrl),
  openAiSdkProxy: createOpenAiSdkProxyExample(options),
  agentInstruction: createAgentInstructionExample(options),
});

export const createSetupPackageText = ({
  usageUrl,
  proxyBaseUrl,
  model,
  readinessSummary,
}: IntegrationExampleOptions & { readinessSummary: string }) => `Token Shredder 当前接入包

${readinessSummary}

本机地址：
- Usage endpoint: ${normalizeUrl(usageUrl, fallbackUsageUrl)}
- OpenAI-compatible proxy baseURL: ${normalizeUrl(proxyBaseUrl, fallbackProxyBaseUrl)}
- Model / endpoint ID: ${normalizeModel(model)}

推荐接入顺序：
1. 如果你的工具已经能拿到 token usage，优先用 POST /usage。
2. 如果你的工具使用 OpenAI-compatible SDK，把 baseURL 改成本机 proxy。
3. 不要把 prompt、completion、messages 或 API key 写入 usage 日志。

curl:
${createCurlUsageExample(usageUrl)}

JavaScript fetch:
${createJsUsageExample(usageUrl)}

Python requests:
${createPythonUsageExample(usageUrl)}

OpenAI SDK proxy:
${createOpenAiSdkProxyExample({ proxyBaseUrl, model })}
`;
