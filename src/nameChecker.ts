import { promises as fs } from 'fs';

class NameChecker {
  heroList: Array<string> = [];

  // constructor() {}
  async updateHeroList(): Promise<void> {
    const heroData: JSON = JSON.parse(await fs.readFile('./src/data/heroData.json', 'utf-8'));
    const names = Object.keys(heroData).map((name) => {
      return name.toLowerCase();
    });
    this.heroList = names;
  }
  checkCanonicalName(name: string): string {
    name = name.toLowerCase();
    return this.heroList.includes(name) ? name : '';
  }
}

export default NameChecker;
