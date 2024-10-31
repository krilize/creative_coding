import BaseApp from "./BaseApp.js";
import Utils from "./Utils.js";

export default class App extends BaseApp {
  constructor() {
    super();
    this.time = 0;
    this.amplitude = 100;
    this.frequency = 300;
    this.angle = 0;
    this.letterColor = "blue";

    Utils.loadSVG("s.svg").then((letterPoints) => {
      this.letter = letterPoints;
      this.calculateLetterCenter();  
      this.animate();
    });
  }

  calculateLetterCenter() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    this.letter.forEach((path) => {
      path.forEach((point) => {
        if (point.x < minX) minX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.x > maxX) maxX = point.x;
        if (point.y > maxY) maxY = point.y;
      });
    });

   
    this.centerX = minX + (maxX - minX) / 2;
    this.centerY = minY + (maxY - minY) / 2;
  }

  animate() {
    this.time += 0.01;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.letterColor;


    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);

    this.ctx.beginPath();
    this.letter.forEach(path => this.drawPath(path, -this.centerX, -this.centerY));
    this.ctx.fill();


    this.ctx.restore();

    requestAnimationFrame(this.animate.bind(this));
  }

  drawPath(path, offsetX = 0, offsetY = 0) {
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      const angle = this.time + i * this.frequency;

      const x = point.x + Math.cos(angle) * Math.sin(angle) * this.amplitude + offsetX;
      const y = point.y + Math.sin(angle) * Math.cos(angle) * this.amplitude + offsetY;

      if (i !== 0) {
        this.ctx.lineTo(x, y);
      } else {
        this.ctx.moveTo(x, y);
      }
    }
  }
}
