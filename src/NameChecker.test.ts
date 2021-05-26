import NameChecker from './NameChecker';

const nameChecker = new NameChecker();
beforeAll(async () => {
  await nameChecker.updateHeroList();
});

test('check existing', () => {
  expect(nameChecker.checkCanonicalName('angelica')).toContain('angelica');
});
test('check not existing', () => {
  expect(nameChecker.checkCanonicalName('arby')).toBe('');
});
test('check caps', () => {
  expect(nameChecker.checkCanonicalName('Angelica')).toBe('');
});
test('check symbols', () => {
  expect(nameChecker.checkCanonicalName('singelica')).toBe('');
});
