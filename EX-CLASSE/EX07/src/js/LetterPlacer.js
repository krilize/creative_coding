export class LetterPlacer {
  /**
   * Crée un placeur de lettres qui affiche une lettre à une position fixe
   * @param {CanvasRenderingContext2D} ctx - Le contexte de dessin du canvas
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.letter = "A"; // La lettre à afficher
    this.font = "Arial"; // Police d'écriture
    this.fontSize = 200; // Taille augmentée pour une lettre plus grande
    this.color = "#000000"; // Couleur par défaut
    this.rotation = 0; // Ajout de la rotation
  }

  /**
   * Dessine la lettre à une position fixe avec une taille constante
   */
  drawLetter() {
    // Position à droite du canvas
    const x = this.ctx.canvas.width - 150; // Position X à droite
    const y = this.ctx.canvas.height / 2;  // Position Y au milieu verticalement

    this.ctx.save(); // Sauvegarder le contexte
    
    // Appliquer la rotation
    this.ctx.translate(x, y);
    this.ctx.rotate((this.rotation * Math.PI) / 180);
    this.ctx.translate(-x, -y);

    // Configure le style du texte
    this.ctx.font = `bold ${this.fontSize}px ${this.font}`;
    this.ctx.fillStyle = this.color; // Utilisation de la couleur
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Dessine la lettre
    this.ctx.fillText(this.letter, x, y);
    
    this.ctx.restore(); // Restaurer le contexte
  }

  // Cette méthode est maintenant simplifiée car nous n'avons plus besoin d'analyser la distance
  analyzePinchDistance(landmarks) {
    this.drawLetter();
  }
}
