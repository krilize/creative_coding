import BaseApp from "./BaseApp";  // Assurez-vous du bon chemin
import ParticleSystem from "./ParticleSystem";  // Assurez-vous aussi du chemin correct


export default class App extends BaseApp {
  constructor() {
    super();
    this.particleSystem = new ParticleSystem();
    this.animate();  // Appel direct ici
  }
  


  getRandomLetter() {
    const letters =  "undefined";
    const index = Math.floor(Math.random() * letters.length);
    return letters[index];
  }

  generateParticles() {
    if (this.mouse.isPressed) {
      for (let i = 0; i < 3; i++) {
        const letter = this.getRandomLetter();
        const targetX = Math.random() * this.width;
        const targetY = Math.random() * this.height;

        this.particleSystem.addParticle(
          this.mouse.x,
          this.mouse.y,
          targetX,
          targetY,
          letter
        );
      }
    }
  }

  animate() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.generateParticles();
    this.particleSystem.update();
    this.particleSystem.draw(this.ctx);

    requestAnimationFrame(() => this.animate());
  }
}
