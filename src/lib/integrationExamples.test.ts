import { describe, expect, it } from 'vitest';
import {
  createAgentInstructionExample,
  createAgentImplementationPrompt,
  createCurlUsageExample,
  createIntegrationExamples,
  createJsReporterHelperExample,
  createJsUsageExample,
  createOpenAiSdkProxyExample,
  createPythonReporterHelperExample,
  createPythonUsageExample,
  createSetupPackageText,
} from './integrationExamples';

describe('integration example builders', () => {
  it('uses the actual usage URL in direct examples', () => {
    const usageUrl = 'http://127.0.0.1:17392/usage';

    expect(createCurlUsageExample(usageUrl)).toContain(usageUrl);
    expect(createJsUsageExample(usageUrl)).toContain(usageUrl);
    expect(createPythonUsageExample(usageUrl)).toContain(usageUrl);
  });

  it('uses the actual proxy base URL and model in the SDK example', () => {
    const text = createOpenAiSdkProxyExample({
      proxyBaseUrl: 'http://127.0.0.1:17392/v1',
      model: 'doubao-test-endpoint',
    });

    expect(text).toContain('http://127.0.0.1:17392/v1');
    expect(text).toContain('doubao-test-endpoint');
  });

  it('builds a paste-ready agent instruction with privacy boundaries', () => {
    const text = createAgentInstructionExample({
      usageUrl: 'http://127.0.0.1:17393/usage',
      proxyBaseUrl: 'http://127.0.0.1:17393/v1',
      model: '',
    });

    expect(text).toContain('http://127.0.0.1:17393/usage');
    expect(text).toContain('http://127.0.0.1:17393/v1');
    expect(text).toContain('不要把 prompt、completion、messages 或 API key');
    expect(text).toContain('你的模型或接入点 ID');
  });

  it('builds a coding-agent implementation prompt with OpenAI-style usage mapping', () => {
    const text = createAgentImplementationPrompt({
      usageUrl: 'http://127.0.0.1:17395/usage',
      proxyBaseUrl: 'http://127.0.0.1:17395/v1',
      model: 'demo-model',
    });

    expect(text).toContain('请帮我把当前项目接入 Token Shredder');
    expect(text).toContain('http://127.0.0.1:17395/usage');
    expect(text).toContain('prompt_tokens');
    expect(text).toContain('cached_tokens');
    expect(text).toContain('避免重复计费');
    expect(text).toContain('不要把 API key');
  });

  it('builds reporter helpers with the actual endpoint and cached-token subtraction', () => {
    const js = createJsReporterHelperExample('http://127.0.0.1:17397/usage');
    const python = createPythonReporterHelperExample('http://127.0.0.1:17398/usage');

    expect(js).toContain('http://127.0.0.1:17397/usage');
    expect(js).toContain('promptTokens - cachedInputTokens');
    expect(js).toContain('reportOpenAIUsage');
    expect(python).toContain('http://127.0.0.1:17398/usage');
    expect(python).toContain('prompt_tokens - cached_input_tokens');
    expect(python).toContain('report_openai_usage');
  });

  it('returns every integration example from one helper', () => {
    const examples = createIntegrationExamples({
      usageUrl: '',
      proxyBaseUrl: '',
      model: '',
    });

    expect(examples.curlUsage).toContain('17391');
    expect(examples.jsUsage).toContain('fetch');
    expect(examples.pythonUsage).toContain('requests.post');
    expect(examples.jsReporterHelper).toContain('reportOpenAIUsage');
    expect(examples.pythonReporterHelper).toContain('report_openai_usage');
    expect(examples.openAiSdkProxy).toContain('OpenAI');
    expect(examples.agentInstruction).toContain('Token Shredder');
    expect(examples.agentImplementationPrompt).toContain('当前项目接入 Token Shredder');
    expect(examples.providerFieldChecklist).toContain('字段清单');
  });

  it('builds a copyable setup package with status, endpoints, and privacy boundaries', () => {
    const text = createSetupPackageText({
      usageUrl: 'http://127.0.0.1:17394/usage',
      proxyBaseUrl: 'http://127.0.0.1:17394/v1',
      model: 'demo-model',
      readinessSummary: 'Setup readiness: ready',
    });

    expect(text).toContain('Token Shredder 当前接入包');
    expect(text).toContain('Setup readiness: ready');
    expect(text).toContain('http://127.0.0.1:17394/usage');
    expect(text).toContain('http://127.0.0.1:17394/v1');
    expect(text).toContain('demo-model');
    expect(text).toContain('不要把 prompt、completion、messages 或 API key');
  });
});
