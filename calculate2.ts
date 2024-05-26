export class BallPositionCalculator {
  oneDistance: number;
  twoDistance: number;
  threeDistance: number;
  fourDistance: number;

  constructor(
    redDistance: number,
    blueDistance: number,
    greenDistance: number,
    whiteDistance: number
  ) {
    this.oneDistance = redDistance;
    this.twoDistance = blueDistance;
    this.threeDistance = greenDistance;
    this.fourDistance = whiteDistance;
  }

  calculateRelativePosition() {
    // Define the coordinates of your local tetrahedron
    const point1: [number, number, number] = [0.5, 0, 0];
    const point2: [number, number, number] = [0, 0.5, 0];
    const point3: [number, number, number] = [0, 0, 0.5];
    const point4: [number, number, number] = [0, 0, 0];

    // Create functions to calculate sphere intersections
    const sphereIntersection = (
      p1: [number, number, number],
      r1: number,
      p2: [number, number, number],
      r2: number
    ): [number, number, number][] => {
      // Calculate distance between sphere centers
      const distance = Math.sqrt(
        (p2[0] - p1[0]) ** 2 +
        (p2[1] - p1[1]) ** 2 +
        (p2[2] - p1[2]) ** 2
      );

      // Check for no solutions
      if (distance > r1 + r2 || distance < Math.abs(r1 - r2)) {
        return []; // No intersection
      }

      // Calculate intersection circle parameters
      const a = (r1 ** 2 - r2 ** 2 + distance ** 2) / (2 * distance);
      const h = Math.sqrt(r1 ** 2 - a ** 2);
      const x2 =
        p1[0] + ((p2[0] - p1[0]) * a) / distance;
      const y2 =
        p1[1] + ((p2[1] - p1[1]) * a) / distance;
      const z2 =
        p1[2] + ((p2[2] - p1[2]) * a) / distance;

      // Calculate intersection points
      const intersectionPoints: [number, number, number][] = [];
      intersectionPoints.push([
        x2 + ((p2[1] - p1[1]) * h) / distance,
        y2 - ((p2[0] - p1[0]) * h) / distance,
        z2
      ]);
      intersectionPoints.push([
        x2 - ((p2[1] - p1[1]) * h) / distance,
        y2 + ((p2[0] - p1[0]) * h) / distance,
        z2
      ]);

      return intersectionPoints;
    };

    const threeSphereIntersection = (
      p1: [number, number, number],
      r1: number,
      p2: [number, number, number],
      r2: number,
      p3: [number, number, number],
      r3: number
    ): [number, number, number][] => {
      const intersections12 = sphereIntersection(p1, r1, p2, r2);
      if (intersections12.length === 0) return [];

      const possibleSolutions: [number, number, number][] = [];
      for (const intersection of intersections12) {
        const distanceToThirdSphere = Math.sqrt(
          (intersection[0] - p3[0]) ** 2 +
          (intersection[1] - p3[1]) ** 2 +
          (intersection[2] - p3[2]) ** 2
        );
        if (Math.abs(distanceToThirdSphere - r3) < 0.1) { // Tolerance for floating-point precision
          possibleSolutions.push(intersection);
        }
      }
      return possibleSolutions;
    };

    // Calculate positions using the first three distances
    const possiblePositions = threeSphereIntersection(point1, this.oneDistance, point2, this.twoDistance, point3, this.threeDistance);

    if (possiblePositions.length === 0) {
      return []; // No solution found
    }

    // Filter the possible positions based on the fourth distance for verification
    const filteredPositions = possiblePositions.filter((position) => {
      const distanceToFourth = Math.sqrt(
        (position[0] - point4[0]) ** 2 +
        (position[1] - point4[1]) ** 2 +
        (position[2] - point4[2]) ** 2
      );
      return Math.abs(distanceToFourth - this.fourDistance) < 0.1; // Adjust tolerance as needed
    });

    if (filteredPositions.length > 0) {
      return { x: filteredPositions[0][0], y: filteredPositions[0][1], z: filteredPositions[0][2] };
    } else {
      return null; // No valid solution after filtering
    }
  }
}
