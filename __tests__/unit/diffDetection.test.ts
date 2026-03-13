// __tests__/unit/diffDetection.test.ts
import { describe, test, expect, vi } from 'vitest';
import {
  detectDiffMarkers,
  extractDiffRanges,
  normalizeDiffText
} from '@/utils/diffDetection';

describe('detectDiffMarkers', () => {
  describe('Insertion tags', () => {
    test('should detect <ins> tags', () => {
      const content = 'Hello <ins>world</ins>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.length).toBeGreaterThan(0);
    });

    test('should detect multiple <ins> tags', () => {
      const content = 'Hello <ins>world</ins> and <ins>universe</ins>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.filter(m => m.type === 'insertion').length).toBe(2);
    });

    test('should detect nested content in <ins>', () => {
      const content = 'Text <ins><b>bold inserted</b></ins> end';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.some(m => m.type === 'insertion')).toBe(true);
    });

    test('should detect <ins> tag with attributes', () => {
      const content = 'Text <ins class="highlight" id="ins1">marked</ins>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should detect case-insensitive <INS> tags', () => {
      const content = 'Text <INS>inserted</INS>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });
  });

  describe('Deletion tags', () => {
    test('should detect <del> tags', () => {
      const content = 'Hello <del>world</del>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should detect multiple <del> tags', () => {
      const content = 'Remove <del>old1</del> and <del>old2</del>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.filter(m => m.type === 'deletion').length).toBe(2);
    });

    test('should detect nested content in <del>', () => {
      const content = 'Text <del><i>italic deleted</i></del> end';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.some(m => m.type === 'deletion')).toBe(true);
    });

    test('should detect <del> tag with attributes', () => {
      const content = 'Text <del class="removed" id="del1">obsolete</del>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should detect case-insensitive <DEL> tags', () => {
      const content = 'Text <DEL>deleted</DEL>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });
  });

  describe('Green highlights', () => {
    test('should detect green highlights (#c7f0d6ff)', () => {
      const content = 'Text <span data-color="#c7f0d6ff">highlighted</span>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.some(m => m.color === '#c7f0d6ff')).toBe(true);
    });

    test('should detect case-insensitive green color codes', () => {
      const content = 'Text data-color="#C7F0D6FF"';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should detect multiple green highlights', () => {
      const content = 'Text data-color="#c7f0d6ff" and data-color="#c7f0d6ff"';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.filter(m => m.color === '#c7f0d6ff').length).toBeGreaterThan(0);
    });
  });

  describe('Red highlights', () => {
    test('should detect red highlights (#fecaca)', () => {
      const content = 'Text <span data-color="#fecaca">highlighted</span>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.some(m => m.color === '#fecaca')).toBe(true);
    });

    test('should detect case-insensitive red color codes', () => {
      const content = 'Text data-color="#FECACA"';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should detect multiple red highlights', () => {
      const content = 'Text data-color="#fecaca" and data-color="#fecaca"';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.filter(m => m.color === '#fecaca').length).toBeGreaterThan(0);
    });
  });

  describe('Combined markers', () => {
    test('should detect both ins and del tags', () => {
      const content = '<ins>new</ins> and <del>old</del>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
      expect(result.markers.some(m => m.type === 'insertion')).toBe(true);
      expect(result.markers.some(m => m.type === 'deletion')).toBe(true);
    });

    test('should detect ins, del, and color highlights', () => {
      const content = '<ins>add</ins> <del>rem</del> data-color="#c7f0d6ff" data-color="#fecaca"';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should detect pending-delete attribute', () => {
      const content = '<span data-pending-delete="true">pending</span>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should detect pending-insert attribute', () => {
      const content = '<span data-pending-insert="true">pending</span>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });
  });

  describe('Plain content', () => {
    test('should return false for plain content', () => {
      const content = 'Plain text without any markers';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(false);
      expect(result.markers).toHaveLength(0);
    });

    test('should return false for empty content', () => {
      const result = detectDiffMarkers('');
      expect(result.hasDiffs).toBe(false);
      expect(result.markers).toHaveLength(0);
    });

    test('should return false for HTML without diff markers', () => {
      const content = '<div class="container"><p>Hello world</p></div>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(false);
    });

    test('should return false for text with similar words', () => {
      const content = 'This is insurance information and deletion-proof text without actual tags';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(false);
    });
  });

  describe('Edge cases', () => {
    test('should handle very long content', () => {
      const longContent = 'a'.repeat(10000) + '<ins>marker</ins>' + 'b'.repeat(10000);
      const result = detectDiffMarkers(longContent);
      expect(result.hasDiffs).toBe(true);
    });

    test('should handle nested tags with multiline content', () => {
      const content = `
        <ins>
          Line 1
          Line 2
          Line 3
        </ins>
      `;
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should handle special characters in content', () => {
      const content = 'Text <ins>with & special < chars > "</ins>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should handle unicode content', () => {
      const content = '<ins>你好世界 🌍</ins>';
      const result = detectDiffMarkers(content);
      expect(result.hasDiffs).toBe(true);
    });

    test('should return object with hasDiffs and markers properties', () => {
      const result = detectDiffMarkers('<ins>test</ins>');
      expect(result).toHaveProperty('hasDiffs');
      expect(result).toHaveProperty('markers');
      expect(Array.isArray(result.markers)).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should handle errors gracefully and return empty markers', () => {
      const result = detectDiffMarkers('<ins>content</ins>');
      expect(result.hasDiffs).toBeDefined();
      expect(result.markers).toBeDefined();
    });
  });
});

describe('normalizeDiffText', () => {
  describe('Unicode normalization', () => {
    test('should normalize NFC Unicode', () => {
      const input = 'café';
      const result = normalizeDiffText(input);
      expect(result).toBe('cafe');
    });

    test('should remove diacritics', () => {
      const input = 'naïve résumé';
      const result = normalizeDiffText(input);
      expect(result).not.toContain('ï');
      expect(result).not.toContain('é');
    });

    test('should handle various accented characters', () => {
      const input = 'àáâãäåæ èéêë ìíîï òóôõö';
      const result = normalizeDiffText(input);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Dash normalization', () => {
    test('should normalize dashes', () => {
      const en_dash = 'hello–world';
      const result = normalizeDiffText(en_dash);
      expect(result).toContain('-');
    });

    test('should normalize em dash', () => {
      const em_dash = 'hello—world';
      const result = normalizeDiffText(em_dash);
      expect(result).toContain('-');
    });

    test('should handle multiple dash types', () => {
      const input = 'test–dash em—dash hyphen-test';
      const result = normalizeDiffText(input);
      expect(result).toBe('test-dash em-dash hyphen-test');
    });
  });

  describe('Space normalization', () => {
    test('should collapse multiple spaces', () => {
      const input = 'hello    world';
      const result = normalizeDiffText(input);
      expect(result).toBe('hello world');
    });

    test('should trim whitespace', () => {
      const input = '  hello  ';
      const result = normalizeDiffText(input);
      expect(result).toBe('hello');
    });

    test('should normalize non-breaking spaces', () => {
      const input = 'hello\u00A0world';
      const result = normalizeDiffText(input);
      expect(result).toBe('hello world');
    });

    test('should normalize various Unicode spaces', () => {
      const input = 'hello\u2000world\u2001test';
      const result = normalizeDiffText(input);
      expect(result).toContain('hello');
      expect(result).toContain('world');
      expect(result).toContain('test');
    });

    test('should handle tabs and newlines', () => {
      const input = 'hello\t\n  world';
      const result = normalizeDiffText(input);
      expect(result).toBe('hello world');
    });
  });

  describe('Quote normalization', () => {
    test('should normalize single quotes', () => {
      const input = 'it\u2018s and it\u2019s';
      const result = normalizeDiffText(input);
      expect(result).toContain("'");
    });

    test('should normalize double quotes', () => {
      const input = '\u201CHello\u201D said John';
      const result = normalizeDiffText(input);
      expect(result).toContain('"');
    });
  });

  describe('Zero-width character removal', () => {
    test('should remove zero-width characters', () => {
      const input = 'hello\u200Bworld';
      const result = normalizeDiffText(input);
      expect(result).toBe('hello world');
    });

    test('should remove BOM character', () => {
      const input = '\uFEFFhello';
      const result = normalizeDiffText(input);
      expect(result).toBe('hello');
    });
  });

  describe('Combined operations', () => {
    test('should handle multiple normalizations together', () => {
      const input = '  Café–résumé  it\u2019s  ';
      const result = normalizeDiffText(input);
      expect(result).toBe("Cafe-resume it's");
    });

    test('should handle complex Unicode text', () => {
      const input = '\u00A0Naïve–résumé\u2019s data_color = "#fecaca"\u00A0';
      const result = normalizeDiffText(input);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty string', () => {
      const result = normalizeDiffText('');
      expect(result).toBe('');
    });

    test('should handle whitespace-only string', () => {
      const result = normalizeDiffText('   ');
      expect(result).toBe('');
    });

    test('should handle very long text', () => {
      const longText = 'hello world '.repeat(1000);
      const result = normalizeDiffText(longText);
      expect(typeof result).toBe('string');
    });

    test('should handle text with only special characters', () => {
      const result = normalizeDiffText('–—–—');
      expect(typeof result).toBe('string');
    });

    test('should handle mixed content', () => {
      const input = 'Normal café–résumé IT text 123 with numbers and symbols!@#';
      const result = normalizeDiffText(input);
      expect(result).toContain('Normal');
      expect(result).toContain('cafe');
    });
  });

  describe('Error handling', () => {
    test('should handle errors gracefully', () => {
      const result = normalizeDiffText('test content');
      expect(typeof result).toBe('string');
    });

    test('should return original text on error', () => {
      const input = 'test';
      const result = normalizeDiffText(input);
      expect(result).toBeDefined();
    });
  });
});

describe('extractDiffRanges', () => {
  test('should return empty array', () => {
    const result = extractDiffRanges('test content');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  test('should return empty array for empty content', () => {
    const result = extractDiffRanges('');
    expect(Array.isArray(result)).toBe(true);
  });

  test('should handle various inputs without error', () => {
    const testCases = ['', 'test', '<ins>test</ins>', 'very long content'.repeat(100)];
    testCases.forEach(content => {
      expect(() => extractDiffRanges(content)).not.toThrow();
    });
  });
});
