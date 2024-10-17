export default class Noise {
  constructor(context) {
    this.ctx = context;
  }

  draw(x, y, text, color) {
    // this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "15px Arial";
    this.ctx.fillStyle = color;
    
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
  

    
    this.ctx.fillText(text, x, y);
  
  
  }
}
