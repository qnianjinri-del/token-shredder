import { describe, expect, it } from 'vitest';
import type { ProviderId } from '../types';
import { PROVIDER_TEMPLATES, providerTemplateById, providerIds } from './providerTemplates';

describe('provider templates', () => {
  it('keeps every provider id available for storage validation', () => {
    expect(providerIds).toContain('volcengine-ark');
    expect(providerIds).toContain('custom');
    expect(new Set(providerIds).size).toBe(PROVIDER_TEMPLATES.length);
  });

  it('returns a fallback template for unknown ids', () => {
    const fallback = providerTemplateById('not-real' as ProviderId);

    expect(fallback.id).toBe('volcengine-ark');
  });

  it('marks templates as editable examples instead of live official pricing', () => {
    for (const template of PROVIDER_TEMPLATES) {
      expect(template.pricingHint).toMatch(/价格|可编辑|自填/);
      expect(template.setupSteps.length).toBeGreaterThanOrEqual(4);
    }
  });
});
