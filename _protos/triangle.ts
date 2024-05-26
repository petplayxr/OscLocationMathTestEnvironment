import numeric from 'npm:numeric';

type Point2D = [number, number];

class Triangle2D {
  points: Point2D[];

  constructor(points: Point2D[]) {
    this.points = points;
  }

  findSecondTriangle(distances: number[]): Point2D[] {
    const [p1, p2, p3] = this.points;
    const [d1, d2, d3] = distances;

    // Define the system of equations
    const equations = [
      (tx: number, ty: number, theta: number) =>
        Math.sqrt((p1[0] + tx + p1[0] * Math.cos(theta) - p1[1] * Math.sin(theta) - p1[0]) ** 2 + 
                  (p1[1] + ty + p1[0] * Math.sin(theta) + p1[1] * Math.cos(theta) - p1[1]) ** 2) - d1,
      (tx: number, ty: number, theta: number) =>
        Math.sqrt((p2[0] + tx + p2[0] * Math.cos(theta) - p2[1] * Math.sin(theta) - p2[0]) ** 2 + 
                  (p2[1] + ty + p2[0] * Math.sin(theta) + p2[1] * Math.cos(theta) - p2[1]) ** 2) - d2,
      (tx: number, ty: number, theta: number) =>
        Math.sqrt((p3[0] + tx + p3[0] * Math.cos(theta) - p3[1] * Math.sin(theta) - p3[0]) ** 2 + 
                  (p3[1] + ty + p3[0] * Math.sin(theta) + p3[1] * Math.cos(theta) - p3[1]) ** 2) - d3,
    ];

    // Define the objective function
    const objectiveFunction = (params: number[]) => {
      const [tx, ty, theta] = params;
      return equations.reduce((sum, eq) => sum + eq(tx, ty, theta) ** 2, 0);
    };

    // Initial guess
    const initialGuess = [0, 0, 0];

    // Perform the optimization using Nelder-Mead
    const result = numeric.uncmin(objectiveFunction, initialGuess);

    const [tx, ty, theta] = result.solution;

    // Apply the transformation to get the second triangle points
    const R = [
      [Math.cos(theta), -Math.sin(theta)],
      [Math.sin(theta), Math.cos(theta)]
    ];

    const transform = (point: Point2D): Point2D => {
      return [
        point[0] * R[0][0] + point[1] * R[0][1] + tx,
        point[0] * R[1][0] + point[1] * R[1][1] + ty
      ];
    };

    return [transform(p1), transform(p2), transform(p3)];
  }
}

// Example usage:
const triangle = new Triangle2D([
  [0.1, 0],
  [0, 0.1],
  [0, 0]
]);

const distances = [1, 1, 1];
const secondTriangle = triangle.findSecondTriangle(distances);

console.log('Second Triangle Points:', secondTriangle);