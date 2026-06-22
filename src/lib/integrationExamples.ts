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

export const createJsReporterHelperExample = (usageUrl: string) => `const TOKEN_SHREDDER_URL =
  process.env.TOKEN_SHREDDER_URL || "${normalizeUrl(usageUrl, fallbackUsageUrl)}";

const numberFrom = (...values) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/,/g, "").trim());
      if (Number.isFinite(parsed)) return Math.max(0, parsed);
    }
  }
  return 0;
};

export const eventFromOpenAIUsage = ({
  source = "my-agent",
  scenarioName = "AI call",
  usage,
  directCost = 0,
}) => {
  const promptTokens = numberFrom(usage?.prompt_tokens, usage?.input_tokens);
  const cachedInputTokens = numberFrom(
    usage?.prompt_tokens_details?.cached_tokens,
    usage?.input_tokens_details?.cached_tokens,
  );

  return {
    source,
    scenarioName,
    inputTokens: Math.max(0, promptTokens - cachedInputTokens),
    outputTokens: numberFrom(usage?.completion_tokens, usage?.output_tokens),
    cachedInputTokens,
    reasoningTokens: numberFrom(
      usage?.completion_tokens_details?.reasoning_tokens,
      usage?.output_tokens_details?.reasoning_tokens,
    ),
    directCost: numberFrom(directCost),
  };
};

export const reportUsage = async (event, endpoint = TOKEN_SHREDDER_URL) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(\`Token Shredder rejected usage: \${response.status} \${body}\`);
  }

  return body ? JSON.parse(body) : null;
};

export const reportOpenAIUsage = async (response, options = {}) => {
  const event = eventFromOpenAIUsage({
    source: options.source,
    scenarioName: options.scenarioName,
    usage: response?.usage,
    directCost: options.directCost,
  });

  const total =
    event.inputTokens +
    event.outputTokens +
    event.cachedInputTokens +
    event.reasoningTokens +
    event.directCost;

  if (total <= 0) return null;
  return reportUsage(event, options.endpoint);
};`;

export const createPythonReporterHelperExample = (usageUrl: string) => `import json
import os
import urllib.request


TOKEN_SHREDDER_URL = os.environ.get("TOKEN_SHREDDER_URL", "${normalizeUrl(usageUrl, fallbackUsageUrl)}")


def number_from(*values):
    for value in values:
        if isinstance(value, (int, float)):
            return max(0, value)
        if isinstance(value, str) and value.strip():
            try:
                return max(0, float(value.replace(",", "").strip()))
            except ValueError:
                pass
    return 0


def event_from_openai_usage(source="my-python-agent", scenario_name="AI call", usage=None, direct_cost=0):
    usage = usage or {}
    prompt_details = usage.get("prompt_tokens_details") or usage.get("input_tokens_details") or {}
    completion_details = usage.get("completion_tokens_details") or usage.get("output_tokens_details") or {}
    prompt_tokens = number_from(usage.get("prompt_tokens"), usage.get("input_tokens"))
    cached_input_tokens = number_from(
        prompt_details.get("cached_tokens"),
        prompt_details.get("cached_input_tokens"),
    )

    return {
        "source": source,
        "scenarioName": scenario_name,
        "inputTokens": max(0, prompt_tokens - cached_input_tokens),
        "outputTokens": number_from(usage.get("completion_tokens"), usage.get("output_tokens")),
        "cachedInputTokens": cached_input_tokens,
        "reasoningTokens": number_from(
            completion_details.get("reasoning_tokens")
        ),
        "directCost": number_from(direct_cost),
    }


def report_usage(event, endpoint=TOKEN_SHREDDER_URL):
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(event).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def report_openai_usage(response, source="my-python-agent", scenario_name="AI call", endpoint=TOKEN_SHREDDER_URL):
    usage = response.get("usage") if isinstance(response, dict) else getattr(response, "usage", None)
    event = event_from_openai_usage(source=source, scenario_name=scenario_name, usage=usage)
    total = sum(event[key] for key in ["inputTokens", "outputTokens", "cachedInputTokens", "reasoningTokens", "directCost"])
    if total <= 0:
        return None
    return report_usage(event, endpoint=endpoint)`;

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

export const createAgentImplementationPrompt = ({
  usageUrl,
  proxyBaseUrl,
  model,
}: IntegrationExampleOptions) => `请帮我把当前项目接入 Token Shredder，用于本机可视化 AI token 花费。

Token Shredder 本机 usage endpoint：
${normalizeUrl(usageUrl, fallbackUsageUrl)}

Token Shredder 本机 OpenAI-compatible proxy baseURL：
${normalizeUrl(proxyBaseUrl, fallbackProxyBaseUrl)}

当前模型 / 接入点 ID：
${normalizeModel(model)}

请按下面优先级实现：

1. 如果项目能从模型响应里拿到 usage，请在每次模型调用结束后 POST 到 /usage。
2. 如果项目使用 OpenAI-compatible SDK，也可以把客户端 baseURL 改成上面的本机 proxy。
3. 如果响应是 OpenAI-style usage，请正确映射：
   - prompt_tokens -> input tokens
   - completion_tokens -> output tokens
   - prompt_tokens_details.cached_tokens -> cached input tokens
   - completion_tokens_details.reasoning_tokens -> reasoning tokens
   - 如果 prompt_tokens 包含 cached_tokens，普通 inputTokens 应该扣掉 cached_tokens，避免重复计费。
4. 如果项目拿不到 usage，不要伪造 token 数；只保留清晰的 TODO 或诊断日志。

POST /usage 推荐 JSON：
{
  "source": "你的工具名",
  "scenarioName": "当前任务名",
  "inputTokens": 0,
  "outputTokens": 0,
  "cachedInputTokens": 0,
  "reasoningTokens": 0,
  "directCost": 0
}

隐私要求：
- 不要把 prompt、completion、messages、request body 写入 Token Shredder。
- 不要把 API key 或 Authorization header 写入日志。
- 不要上传 usage 到云端。
- 只发送 token 数字、source、scenarioName 和必要的本地成本字段。

请完成代码修改，并补充最小测试或手动验证步骤。`;

export const createProviderFieldChecklist = ({
  proxyBaseUrl,
  model,
}: Pick<IntegrationExampleOptions, 'proxyBaseUrl' | 'model'>) => `Token Shredder 本机代理接入字段清单

你需要准备：
1. 上游 provider 的 API Key
2. 上游 Base URL，例如服务商提供的 OpenAI-compatible endpoint
3. 模型 / deployment / endpoint ID：${normalizeModel(model)}
4. input / output / cached input / reasoning 的每 1M tokens 价格
5. 客户端 baseURL 改为：${normalizeUrl(proxyBaseUrl, fallbackProxyBaseUrl)}

注意：
- 价格是你手动填写的估算值，不是官方实时价格。
- API Key 默认不写入 usage 日志。
- 如果只使用 POST /usage，不需要把 API Key 交给 Token Shredder。`;

export const createIntegrationExamples = (options: IntegrationExampleOptions) => ({
  curlUsage: createCurlUsageExample(options.usageUrl),
  jsUsage: createJsUsageExample(options.usageUrl),
  pythonUsage: createPythonUsageExample(options.usageUrl),
  jsReporterHelper: createJsReporterHelperExample(options.usageUrl),
  pythonReporterHelper: createPythonReporterHelperExample(options.usageUrl),
  openAiSdkProxy: createOpenAiSdkProxyExample(options),
  agentInstruction: createAgentInstructionExample(options),
  agentImplementationPrompt: createAgentImplementationPrompt(options),
  providerFieldChecklist: createProviderFieldChecklist(options),
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

JavaScript reporter helper:
${createJsReporterHelperExample(usageUrl)}

Python reporter helper:
${createPythonReporterHelperExample(usageUrl)}

OpenAI SDK proxy:
${createOpenAiSdkProxyExample({ proxyBaseUrl, model })}

给 AI coding agent 的接入提示词:
${createAgentImplementationPrompt({ usageUrl, proxyBaseUrl, model })}
`;
