import Noise from "./Noise.js";

export default class App {
  constructor() {
    this.canvas;
    this.ctx;
  }
  createCanvas(width, height) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = width;
    this.canvas.height = height;
    document.body.appendChild(this.canvas);
     // Définir la couleur de fond (par exemple, gris clair)
  this.ctx.fillStyle = "black";
  
  // Remplir tout le canevas avec la couleur définie
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
  }


  createGrid() {
    const monNoise = new Noise(this.ctx);
    let stepX = 200;
    let stepY = 200;
    let spaceX = window.innerWidth / stepX;
    let spaceY = window.innerHeight / stepY;

    let texts = ["!", "£", ":", "0", "$"];
    let color = [, "black", "gray", "blue"];
    let speed  = 10;
    let lastTime = 0;

    
    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      if(deltaTime > speed){
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   
    for (let i = 0; i < stepX; i++) {
      for (let j = 0; j < stepY; j++) {
        // do something
        let randomText = texts[Math.floor(Math.random() * texts.length)];
        let randomColor = color[Math.floor(Math.random() * color.length)];
      
        monNoise.draw(i * spaceX, j * spaceY, randomText, randomColor);
      }
    }
    lastTime = currentTime;
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
} 
}
