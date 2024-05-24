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
    for (let i = 0; i < this.points.length; i++) {
      for (let j = i + 1; j < this.points.length; j++) {
        const solutions = this.twoCircleIntersection(
          this.points[i],
          this.distances[i],
          this.points[j],
          this.distances[j]
        );
        
        // You might want to add logic here to choose the "best" solution 
        // from 'solutions' if you get multiple valid intersections.
        // For now, we are returning the first valid solution found.
        if (solutions.length > 0) {
          return solutions[0];
        }
      }
    }
    return undefined; // No valid horizontal position found
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

    return [intersection1]; 
  }
}