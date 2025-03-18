import { cn } from './utils';

describe('cn function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
    expect(cn('class1', { class2: false }, 'class3')).toBe('class1 class3');
    expect(cn(null, undefined, 'class1', { class2: true })).toBe('class1 class2');
  });
}); 