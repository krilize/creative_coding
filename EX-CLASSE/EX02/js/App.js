import Noise from "./Noise.js";
import Easing from "./Easing.js";

export default class App {
  constructor() {
    this.canvas;
    this.ctx;
    this.letters = []; 
    this.letterRadius = 100; 
    this.createCanvas(window.innerWidth, window.innerHeight); 
    this.createGrid(); 
    this.initInteraction(); 
    this.animate(); 
  }

  createCanvas(width, height) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = width;
    this.canvas.height = height;
    document.body.appendChild(this.canvas);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  createGrid() {
   
    let stepX = 100;
    let stepY = 100;
    let spaceX = window.innerWidth / stepX;
    let spaceY = window.innerHeight / stepY;

    let texts = ["!", "£", ":", "0", "$"];
    let color = ["black", "gray", "blue"];

    for (let i = 0; i < stepX; i++) {
      for (let j = 0; j < stepY; j++) {
        let randomText = texts[Math.floor(Math.random() * texts.length)];
        let randomColor = color[Math.floor(Math.random() * color.length)];
        
        let letter = {
          x: i * spaceX,
          y: j * spaceY,
          originX: i * spaceX,
          originY: j * spaceY,
          text: randomText,
          color: randomColor,
          targetX: i * spaceX, 
          targetY: j * spaceY, 
          timing: 0 
        };
        this.letters.push(letter);
      }
    }
  }

  initInteraction() {

    this.canvas.addEventListener("click", (e) => {
      this.handleClick(e);
    });
  }

  handleClick(e) {
    const clickX = e.clientX;
    const clickY = e.clientY;

    
    this.letters.forEach(letter => {
      const distX = letter.x - clickX;
      const distY = letter.y - clickY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      
      if (distance < this.letterRadius) {
        
        const angle = Math.atan2(distY, distX);
        const moveDistance = this.letterRadius * 2; 
        letter.targetX = letter.x + Math.cos(angle) * moveDistance;
        letter.targetY = letter.y + Math.sin(angle) * moveDistance;
        letter.timing = 0; 
      }
    });
  }

  animate() {
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    
    this.letters.forEach(letter => {
      letter.timing += 0.02; 

      
      letter.x = letter.originX + (letter.targetX - letter.originX) * Easing.expoInOut(letter.timing);
      letter.y = letter.originY + (letter.targetY - letter.originY) * Easing.expoInOut(letter.timing);

      
      const monNoise = new Noise(this.ctx);
      monNoise.draw(letter.x, letter.y, letter.text, letter.color);
    });

    
    requestAnimationFrame(this.animate.bind(this));
  }
}
