export class BackgammonBoardAnalyzer {
  constructor() {
    this.cv = window.cv; // OpenCV instance
    this.pointPositions = [];
    this.dicePositions = [];
    this.calibrated = false;
  }

  async initialize() {
    // Wait for OpenCV.js to be loaded
    if (!window.cv) {
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://docs.opencv.org/4.8.0/opencv.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
    this.cv = window.cv;
  }

  calibrateBoard(frame) {
    // Convert frame to Mat
    const mat = this.cv.imread(frame);
    const gray = new this.cv.Mat();
    this.cv.cvtColor(mat, gray, this.cv.COLOR_RGBA2GRAY);

    // Find board corners using contours
    const edges = new this.cv.Mat();
    this.cv.Canny(gray, edges, 50, 150);

    const contours = new this.cv.MatVector();
    const hierarchy = new this.cv.Mat();
    this.cv.findContours(
      edges,
      contours,
      hierarchy,
      this.cv.RETR_EXTERNAL,
      this.cv.CHAIN_APPROX_SIMPLE
    );

    // Find the largest quadrilateral contour (likely the board)
    let maxArea = 0;
    let boardContour = null;
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const area = this.cv.contourArea(contour);
      if (area > maxArea) {
        const perimeter = this.cv.arcLength(contour, true);
        const approx = new this.cv.Mat();
        this.cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);

        if (approx.rows === 4) {
          maxArea = area;
          boardContour = approx;
        }
      }
    }

    if (boardContour) {
      // Store point positions for future reference
      this.calculatePointPositions(boardContour);
      this.calibrated = true;
    }

    // Clean up
    mat.delete();
    gray.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();

    return this.calibrated;
  }

  calculatePointPositions(boardContour) {
    // Calculate 24 point positions based on board corners
    // This will create a grid of points where checkers can be
    this.pointPositions = [];

    // Get corner points
    const points = [];
    for (let i = 0; i < 4; i++) {
      points.push({
        x: boardContour.data32S[i * 2],
        y: boardContour.data32S[i * 2 + 1],
      });
    }

    // Sort points to get top-left, top-right, bottom-right, bottom-left
    points.sort((a, b) => a.x - b.x);
    const left = points.slice(0, 2).sort((a, b) => a.y - b.y);
    const right = points.slice(2).sort((a, b) => a.y - b.y);

    // Calculate points for each triangle on the board
    for (let i = 0; i < 12; i++) {
      // Calculate points for both sides of the board
      this.calculatePointPosition(left[0], right[0], i, 0); // Top row
      this.calculatePointPosition(left[1], right[1], i, 1); // Bottom row
    }
  }

  calculatePointPosition(start, end, index, row) {
    const x = start.x + (end.x - start.x) * (index / 11);
    const y = start.y + (end.y - start.y) * (index / 11);
    this.pointPositions.push({ x, y, row, index });
  }

  analyzeFrame(frame) {
    if (!this.calibrated) {
      throw new Error("Board not calibrated");
    }

    const mat = this.cv.imread(frame);

    // Analyze checker positions
    const checkers = this.detectCheckers(mat);

    // Analyze dice
    const dice = this.detectDice(mat);

    mat.delete();

    return {
      checkers,
      dice,
      timestamp: new Date().toISOString(),
    };
  }

  detectCheckers(mat) {
    const checkerPositions = [];

    // Convert to HSV for better color detection
    const hsv = new this.cv.Mat();
    this.cv.cvtColor(mat, hsv, this.cv.COLOR_BGR2HSV);

    // Detect black checkers
    const blackMask = new this.cv.Mat();
    this.cv.inRange(
      hsv,
      new this.cv.Mat(1, 1, 0, [0, 0, 0]),
      new this.cv.Mat(1, 1, 0, [180, 255, 50]),
      blackMask
    );

    // Detect white checkers
    const whiteMask = new this.cv.Mat();
    this.cv.inRange(
      hsv,
      new this.cv.Mat(1, 1, 0, [0, 0, 200]),
      new this.cv.Mat(1, 1, 0, [180, 30, 255]),
      whiteMask
    );

    // Find checker contours
    const contours = new this.cv.MatVector();
    const hierarchy = new this.cv.Mat();

    // Process both black and white checkers
    [blackMask, whiteMask].forEach((mask, colorIndex) => {
      this.cv.findContours(
        mask,
        contours,
        hierarchy,
        this.cv.RETR_EXTERNAL,
        this.cv.CHAIN_APPROX_SIMPLE
      );

      for (let i = 0; i < contours.size(); ++i) {
        const contour = contours.get(i);
        const area = this.cv.contourArea(contour);

        // Filter by size to eliminate noise
        if (area > 100) {
          const moments = this.cv.moments(contour);
          const center = {
            x: moments.m10 / moments.m00,
            y: moments.m01 / moments.m00,
          };

          // Find nearest point position
          const point = this.findNearestPoint(center);
          if (point) {
            checkerPositions.push({
              point: point.index,
              color: colorIndex === 0 ? "black" : "white",
              position: center,
            });
          }
        }
      }
    });

    // Clean up
    hsv.delete();
    blackMask.delete();
    whiteMask.delete();
    contours.delete();
    hierarchy.delete();

    return checkerPositions;
  }

  detectDice(mat) {
    const dice = [];

    // Convert to grayscale
    const gray = new this.cv.Mat();
    this.cv.cvtColor(mat, gray, this.cv.COLOR_BGR2GRAY);

    // Threshold to get dice dots
    const thresh = new this.cv.Mat();
    this.cv.threshold(gray, thresh, 200, 255, this.cv.THRESH_BINARY);

    // Find contours of dice dots
    const contours = new this.cv.MatVector();
    const hierarchy = new this.cv.Mat();
    this.cv.findContours(
      thresh,
      contours,
      hierarchy,
      this.cv.RETR_EXTERNAL,
      this.cv.CHAIN_APPROX_SIMPLE
    );

    // Group dots into dice
    const dots = [];
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const area = this.cv.contourArea(contour);

      // Filter small dots
      if (area > 20 && area < 100) {
        const moments = this.cv.moments(contour);
        dots.push({
          x: moments.m10 / moments.m00,
          y: moments.m01 / moments.m00,
        });
      }
    }

    // Group dots into dice based on proximity
    while (dots.length > 0) {
      const diceDots = this.findDiceDots(dots);
      if (diceDots.length > 0) {
        dice.push({
          value: diceDots.length,
          position: this.calculateDiceCenter(diceDots),
        });
      }
    }

    // Clean up
    gray.delete();
    thresh.delete();
    contours.delete();
    hierarchy.delete();

    return dice;
  }

  findNearestPoint(position) {
    let nearest = null;
    let minDistance = Infinity;

    this.pointPositions.forEach((point) => {
      const distance = Math.hypot(position.x - point.x, position.y - point.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    return minDistance < 50 ? nearest : null;
  }

  findDiceDots(dots) {
    if (dots.length === 0) return [];

    const diceDots = [dots[0]];
    dots.splice(0, 1);

    // Find all dots within reasonable distance of first dot
    for (let i = dots.length - 1; i >= 0; i--) {
      const distance = Math.hypot(
        dots[i].x - diceDots[0].x,
        dots[i].y - diceDots[0].y
      );

      if (distance < 50) {
        diceDots.push(dots[i]);
        dots.splice(i, 1);
      }
    }

    return diceDots;
  }

  calculateDiceCenter(dots) {
    const sum = dots.reduce(
      (acc, dot) => ({
        x: acc.x + dot.x,
        y: acc.y + dot.y,
      }),
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / dots.length,
      y: sum.y / dots.length,
    };
  }
}
