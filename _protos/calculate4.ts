import numeric from 'npm:numeric';

type Point3D = [number, number, number];

export class BallPositionCalculator {
  redDistance: number;
  blueDistance: number;
  greenDistance: number;
  whiteDistance: number;

  constructor(redDistance: number, blueDistance: number, greenDistance: number, whiteDistance: number) {
    this.redDistance = redDistance;
    this.blueDistance = blueDistance;
    this.greenDistance = greenDistance;
    this.whiteDistance = whiteDistance;
  }

  calculateRelativePosition(): Point3D | undefined {
    const points: Point3D[] = [
      [0.1, 0, 0],
      [0, 0.1, 0],
      [0, 0, 0.1],
      [0, 0, 0]
    ];

    const [p1] = points;
    const d1 = this.redDistance;

    // Define the system of equations for just the first point
    const equations = [
      (tx: number, ty: number, tz: number) =>
        Math.sqrt(
          (p1[0] + tx) ** 2 +
          (p1[1] + ty) ** 2 +
          (p1[2] + tz) ** 2
        ) - d1
    ];

    // Define the objective function
    const objectiveFunction = (params: number[]) => {
      const [tx, ty, tz] = params;
      return equations.reduce((sum, eq) => sum + eq(tx, ty, tz) ** 2, 0);
    };

    // Initial guess
    const initialGuess = [0, 0, 0];

    // Perform the optimization using Nelder-Mead
    const result = numeric.uncmin(objectiveFunction, initialGuess);

    const [tx, ty, tz] = result.solution;

    return [tx, ty, tz];
  }
}
