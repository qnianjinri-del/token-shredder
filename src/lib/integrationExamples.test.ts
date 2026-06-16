import { describe, expect, it } from 'vitest';
import {
  createAgentInstructionExample,
  createCurlUsageExample,
  createIntegrationExamples,
  createJsUsageExample,
  createOpenAiSdkProxyExample,
  createPythonUsageExample,
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

  it('returns every integration example from one helper', () => {
    const examples = createIntegrationExamples({
      usageUrl: '',
      proxyBaseUrl: '',
      model: '',
    });

    expect(examples.curlUsage).toContain('17391');
    expect(examples.jsUsage).toContain('fetch');
    expect(examples.pythonUsage).toContain('requests.post');
    expect(examples.openAiSdkProxy).toContain('OpenAI');
    expect(examples.agentInstruction).toContain('Token Shredder');
  });
});
