import NameChecker from './NameChecker';

const nameChecker = new NameChecker();
beforeAll(async () => {
  await nameChecker.updateHeroList();
});

test('check angelica', () => {
  expect(nameChecker.checkCanonicalName('angelica')).toContain('angelica');
});
test('check arby', () => {
  expect(nameChecker.checkCanonicalName('arby')).toBe('');
});
