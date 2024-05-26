import * as math from "npm:mathjs"
import * as numeric from "npm:numeric"

export class BallPositionCalculator {
  private distances: number[];
  private points: [number, number, number][];

  constructor(
    redDistance: number,
    blueDistance: number,
    greenDistance: number,
    whiteDistance: number
  ) {
    this.distances = [redDistance, blueDistance, greenDistance, whiteDistance];
    this.points = [
      [0.1, 0, 0],
      [0, 0.1, 0],
      [0, 0, 0.1],
      [0, 0, 0], // Origin
    ];
  }

  private Kabsch(
    points: [number, number, number][],
    targetPoints: [number, number, number][]
  ): { alignedPoints: [number, number, number][]; rotationMatrix: math.Matrix } {

    // Calculate centroids
    const centroidA = math.mean(points, 0) as [number, number, number]; 
    const centroidB = math.mean(targetPoints, 0) as [number, number, number];

    // Center the points around their respective centroids
    const centeredA = points.map((p) => math.subtract(p, centroidA) as [number, number, number]);
    const centeredB = targetPoints.map((p) => math.subtract(p, centroidB) as [number, number, number]); 

    // Calculate the covariance matrix H
    const H = math.multiply(math.transpose(centeredA), centeredB);

    // Perform SVD
    const [U, , V] = numeric.svd(H);

    // Calculate rotation matrix
    const R = math.multiply(V, math.transpose(U)) as math.Matrix;

    // Apply rotation and translation
    const alignedPoints = centeredA.map((p) =>
      math.add(math.multiply(R, p), centroidB) as [number, number, number]
    );

    return { alignedPoints, rotationMatrix: R }; 
  }

  calculateRelativePosition(): [number, number, number] | undefined {
    // 1. Solve for (x, y) using circle intersections on the horizontal plane
    const horizontalPosition = this.calculateHorizontalPosition();
    if (!horizontalPosition) {
      //console.error("Could not determine a valid horizontal position.");
      return undefined;
    }

    // 2. Calculate z using the calculated (x, y) and the distances
    const z = this.calculateZCoordinate(horizontalPosition); 
    if (!z) {
      //console.error("Could not determine a valid z coordinate.");
      return undefined;
    }

    // 3. Combine (x, y) and z to get the 3D position
    return [...horizontalPosition, z]; 
  }

  // Calculate the (x, y) coordinates using circle intersections
  private calculateHorizontalPosition(): [number, number] | undefined {

    const [furthestIndex, closestIndex] = this.findFurthestAndClosest();
    const [leastDistinct1, leastDistinct2] = this.findLeastDistinctPoints();

    const solutions = this.twoCircleIntersection(
      this.points[leastDistinct1],
      this.distances[leastDistinct1],
      this.points[leastDistinct2],
      this.distances[leastDistinct2]
    );

    if (solutions.length === 0) {
      return undefined; // No intersection
    }

    // 3. Determine the correct intersection point 
    const correctIntersection = this.selectCorrectIntersection(
      solutions, 
      furthestIndex, 
      closestIndex
    );

    return correctIntersection;
  }

  // Helper function to find the indices of the furthest and closest points
  private findFurthestAndClosest(): [number, number] {
    let furthestIndex = 0;
    let closestIndex = 0;
    let furthestDistance = this.distances[0];
    let closestDistance = this.distances[0];

    for (let i = 1; i < this.distances.length; i++) {
      if (this.distances[i] > furthestDistance) {
        furthestDistance = this.distances[i];
        furthestIndex = i;
      }
      if (this.distances[i] < closestDistance) {
        closestDistance = this.distances[i];
        closestIndex = i;
      }
    }

    return [furthestIndex, closestIndex];
  }

  // Helper function to find the indices of the two least distinct points
  private findLeastDistinctPoints(): [number, number] {
    let minDistanceDifference = Infinity;
    let leastDistinct1 = 0;
    let leastDistinct2 = 1;
  
    for (let i = 0; i < this.distances.length; i++) {
      for (let j = i + 1; j < this.distances.length; j++) {
        const distanceDifference = Math.abs(this.distances[i] - this.distances[j]);
  
        if (distanceDifference > minDistanceDifference) {
          minDistanceDifference = distanceDifference;
          leastDistinct1 = i;
          leastDistinct2 = j;
        }
      }
    }
    console.log("red1, blue2, green3, white4")
    console.log(this.distances[0], this.distances[1],this.distances[2],this.distances[3])
  
    return [leastDistinct1, leastDistinct2];
  }

  // Function to select the correct intersection point
  private selectCorrectIntersection(
    solutions: [[number, number]],
    furthestIndex: number,
    closestIndex: number
  ): [number, number] | undefined {

    if (solutions.length === 1) {
      return solutions[0]; // Only one intersection, it must be correct
    }

    // 4. Calculate distance differences for each intersection point 
    let diffSum1 = 0;
    let diffSum2 = 0;

    for (let i = 0; i < this.points.length; i++) {
      if (i === furthestIndex || i === closestIndex) {
        continue; // Skip the furthest and closest points
      }

      // Calculate distances from each intersection to the current point
      const distance1 = this.calculateDistance2D(solutions[0], this.points[i]);
      const distance2 = this.calculateDistance2D(solutions[1], this.points[i]);

      // Calculate the difference relative to the known distance
      diffSum1 += Math.abs(distance1 - this.distances[i]); 
      diffSum2 += Math.abs(distance2 - this.distances[i]);
    }

    // 5. Choose the intersection with the smaller total difference

    const EPSILON = 1e-10; // Small error threshold 

    if (Math.abs(diffSum1 - diffSum2) < EPSILON) {
      // Differences are practically equal - additional logic might be needed!
      // You could try:
      //    - Checking distances to the fourth point
      //    - Logging a warning and returning one of the solutions
      //    - Returning undefined to indicate ambiguity
      // console.warn("Intersection point selection ambiguous - differences are very close.");
      return solutions[0]; 
    } else if (diffSum1 < diffSum2) {
      return solutions[0]; 
    } else { 
      return solutions[1];
    }

    // Handle cases where differences are equal (additional logic might be needed)

  }

  // Helper function to calculate 2D distance between two points
  private calculateDistance2D(
    point1: [number, number],
    point2: [number, number, number]
  ): number {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Calculate the z coordinate given (x, y) and distances
  private calculateZCoordinate(xy: [number, number]): number | undefined {
    // Simplified calculation for z (you might need to adapt this)
    for (let i = 0; i < this.points.length; i++) {
      const dx = xy[0] - this.points[i][0];
      const dy = xy[1] - this.points[i][1];
      const dzSquared = this.distances[i] ** 2 - dx ** 2 - dy ** 2;

      if (dzSquared >= 0) { 
        return Math.sqrt(dzSquared);
      }
    }
    return undefined;
  }

  // Function to calculate the intersection of two circles
  // (Simplified for 2D - x and y coordinates only)
  private twoCircleIntersection(
    p1: [number, number, number],
    r1: number,
    p2: [number, number, number],
    r2: number
  ): [[number, number]] | [] {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > r1 + r2 || distance < Math.abs(r1 - r2)) {
      return [];
    }

    const a = (r1 * r1 - r2 * r2 + distance * distance) / (2 * distance);
    const h = Math.sqrt(r1 * r1 - a * a);

    const x2 = p1[0] + (dx * a) / distance;
    const y2 = p1[1] + (dy * a) / distance;

    const intersection1: [number, number] = [x2 + (dy * h) / distance, y2 - (dx * h) / distance];
    const intersection2: [number, number] = [x2 - (dy * h) / distance, y2 + (dx * h) / distance];

    return [intersection1, intersection2]; 
  }
}