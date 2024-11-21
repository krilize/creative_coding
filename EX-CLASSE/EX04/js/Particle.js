import Utils from "./Utils";

export default class Particle {
  constructor(x, y, targetX, targetY, letter) {
    this.pos = { x, y };
    this.target = { x: targetX, y: targetY };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };

    this.radius = 0; // Pas de rayon pour une lettre
    this.maxSpeed = 3;
    this.maxForce = 0.1;
    this.slowDownDistance = 50;

    this.isAtTarget = false;
    this.isDead = false;
    this.letter = letter; // La lettre assignée à cette particule
  }

  seek() {
    if (this.isDead) return { x: 0, y: 0 };

    const desired = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    };

    const distanceToTarget = Utils.getSpeed(desired);
    const currentSpeed = Utils.getSpeed(this.velocity);

    this.isAtTarget = distanceToTarget < 0.5 && currentSpeed < 0.1;

   

    const movement = Utils.getDirection(desired, this.maxSpeed);
    const steer = {
      x: movement.x - this.velocity.x,
      y: movement.y - this.velocity.y,
    };

    return Utils.getDirection(steer, this.maxForce);
  }

  update() {
    this.lifetime++;

    if (this.isDead) return;

    const steering = this.seek();
    this.acceleration.x += steering.x;
    this.acceleration.y += steering.y;

    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    const speed = Utils.getSpeed(this.velocity);
    if (speed > this.maxSpeed) {
      const movement = Utils.getDirection(this.velocity, this.maxSpeed);
      this.velocity.x = movement.x;
      this.velocity.y = movement.y;
    }

    this.pos.x += this.velocity.x;
    this.pos.y += this.velocity.y;

    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }

  draw(ctx) {
    if (this.isDead) return;
    ctx.font = "20px Arial";  // Taille de la police pour la lettre
    ctx.fillStyle = "blue";   // Couleur de la lettre
    ctx.fillText(this.letter, this.pos.x, this.pos.y);  // Affiche la lettre à la position de la particule
  }
}
