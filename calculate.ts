export class BallPositionCalculator {
    private distances: number[];
    private points: [number, number, number][];

    constructor(redDistance: number, blueDistance: number, greenDistance: number, whiteDistance: number) {
        this.distances = [redDistance, blueDistance, greenDistance, whiteDistance];
        this.points = [
            [0.5, 0, 0],
            [0, 0.5, 0],
            [0, 0, 0.5],
            [0, 0, 0]   // Origin
        ];
    }

    calculateRelativePosition(): [number, number, number] | undefined {
        // Calculate potential positions by checking all combinations of three points
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                for (let k = j + 1; k < this.points.length; k++) {
                    const solutions = this.threeSphereIntersection(this.points[i], this.distances[i], this.points[j], this.distances[j], this.points[k], this.distances[k]);
                    if (solutions.length > 0) {
                        // Optionally check distance to the fourth point here if necessary
                        return solutions[0]; // return first valid position
                    }
                }
            }
        }
        return undefined; // No valid position found
    }

    // Create functions to calculate sphere intersections
    sphereIntersection = (
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

    private threeSphereIntersection(
        p1: [number, number, number], 
        r1: number, 
        p2: [number, number, number], 
        r2: number, 
        p3: [number, number, number], 
        r3: number
    ): [number, number, number][] {
        const intersections12 = this.sphereIntersection(p1, r1, p2, r2);
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
    }
}
