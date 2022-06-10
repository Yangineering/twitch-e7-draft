import NameChecker from './nameChecker';

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
  expect(nameChecker.checkCanonicalName('Angelica')).toBe('angelica');
});
test('check symbols', () => {
  expect(nameChecker.checkCanonicalName('s1ngel1ca')).toBe('');
});

test('check spaces', () => {
  expect(nameChecker.checkCanonicalName('arbiter vildred')).toBe('arbiter vildred');
});

test('check spaces 2', () => {
  expect(nameChecker.checkCanonicalName('Arbiter Vildred')).toBe('arbiter vildred');
});
