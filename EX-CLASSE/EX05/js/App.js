import BaseApp from "./BaseApp";
import Letter from "./Letter";
import Webcam from "./Webcam";

export default class App extends BaseApp {
  constructor() {
    super();
    this.ctx.willReadFrequently = true;
    this.ctx.font = `14px monospace`;
    this.letters = [];
    this.pixelColors = [];
    this.init();
  }

  loadImage(src) {
    return new Promise((resolve) => {
      this.image = new Image() ;
      this.image.onload = resolve;
      this.image.src = src; 
    });
  }

  async init() {
    await this.loadWebcam();
    for(let i = 0; i < 192; i++) {
        for(let j = 0; j < 108; j++) {
            this.letters.push(new Letter(this.ctx, "0", i * 10, j * 10));
        }   
    }
    this.draw();
}

loadWebcam() {
    this.Webcam = new Webcam();
}


draw() {
    this.ctx.drawImage(this.Webcam.video, 0, 0, 1920, 1080);
    const pixels = this.ctx.getImageData(0, 0, 1920, 1080).data;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.letters.forEach((letter) => {
        const i = (letter.y * 1920 + letter.x) * 4;

        
        letter.color = `rgb(${pixels[i]}, ${pixels[i + 1]}, ${pixels[i + 2]})`;

        
        const luminance = this.getLuminance([
            pixels[i],
            pixels[i + 1],
            pixels[i + 2],
        ]);

        
        letter.scale = Math.max(0.5, luminance * 2);

       
        if (luminance > 0.99) {
            letter.color = "blue";
        }

       
        letter.draw();
    });

    requestAnimationFrame(this.draw.bind(this));
}


getLuminance(rgb) {
    return(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}
}
