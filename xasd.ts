//everything here is probably wrong

export class BallPositionCalculator {
    oneDistance: number;
    twoDistance: number;
    threeDistance: number;
    fourDistance: number;

    constructor(redDistance: number, blueDistance: number, greenDistance: number, whiteDistance: number) {
        this.oneDistance = redDistance;
        this.twoDistance = blueDistance;
        this.threeDistance = greenDistance;
        this.fourDistance = whiteDistance;
    }

    calculateRelativePosition() {
        // Define the relative positions of the balls
        const blueRelativePos = [0, 2, 0];
        const greenRelativePos = [0, 0, 2];
        const redRelativePos = [2, 0, 0];
        const whiteRelativePos = [0, 0, 0];

        // Create vectors using distances
        const blueVector = blueRelativePos.map(coord => coord * this.twoDistance);
        const greenVector = greenRelativePos.map(coord => coord * this.threeDistance);
        const redVector = redRelativePos.map(coord => coord * this.oneDistance);
        const whiteVector = whiteRelativePos.map(coord => coord * this.fourDistance);

        // Calculate the relative position by averaging the vectors
        const relativePosition = [
            (blueVector[0] + greenVector[0] + redVector[0] + whiteVector[0]) / 4,
            (blueVector[1] + greenVector[1] + redVector[1] + whiteVector[1]) / 4,
            (blueVector[2] + greenVector[2] + redVector[2] + whiteVector[2]) / 4
        ];

        // Calculate the distance
        const distance = Math.sqrt(
            relativePosition[0] ** 2 +
            relativePosition[1] ** 2 +
            relativePosition[2] ** 2
        );

        return { relativePosition, distance };
    }
}
