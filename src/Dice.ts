export class Dice {
  private faces: number[];

  constructor(faces: number[]) {
    this.faces = faces;
  }

  getFaces(): number[] {
    return [...this.faces];
  }

  roll(randomValue: number): number {
    return this.faces[randomValue % this.faces.length];
  }
}