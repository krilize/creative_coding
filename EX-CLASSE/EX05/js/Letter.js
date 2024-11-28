export default class Letter {
  constructor(ctx, letter, x, y) {
    this.ctx = ctx;
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.color = "black";
    this.scale = 1;
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);

    // Limiter la taille minimale et maximale
    const scale = Math.min(5, Math.max(0.5, this.scale));
    this.ctx.scale(scale, scale);

    this.ctx.fillStyle = this.color;
    this.ctx.fillText(this.letter, 0, 0);
    this.ctx.restore();
}

}
