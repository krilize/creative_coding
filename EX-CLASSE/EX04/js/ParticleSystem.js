import Particle from "./Particle";

export default class ParticleSystem {
  // Initialise le système de particules avec un tableau vide et un nombre maximum de particules
  constructor() {
    this.particles = [];
    this.maxParticles = 3000;
  }

  // Ajoute une nouvelle particule au système avec une position et une cible données
  // si le nombre maximum de particules n'est pas atteint
  addParticle(x, y, targetX, targetY) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push(new Particle(x, y, targetX, targetY, this.letter));
    }
  }

  // Met à jour l'état de toutes les particules et supprime celles qui ont atteint leur cible
  // depuis plus d'une seconde
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update();
    }
  }

  // Dessine toutes les particules actives sur le contexte canvas fourni
  draw(ctx) {
    this.particles.forEach((particle) => {
      particle.draw(ctx);
    });
  }
}
