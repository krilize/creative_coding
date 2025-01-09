import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { LetterPlacer } from "./LetterPlacer";
import BaseApp from "./BaseApp";

export default class App extends BaseApp {
  /**
   * Constructeur de l'application qui initialise les éléments et démarre l'application
   */
  constructor() {
    super();
    this.setupElements();
    this.init();
    
    // Initialisation du letterPlacer dès le début
    this.letterPlacer = new LetterPlacer(this.ctx);
    
    // Ajout d'un tableau de lettres possibles
    this.possibleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    
    // Ajout d'un tableau de couleurs possibles
    this.possibleColors = [
      '#FF0000', // Rouge
      '#00FF00', // Vert
      '#0000FF', // Bleu
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#FFA500', // Orange
      '#800080', // Violet
      '#008000', // Vert foncé
      '#000080', // Bleu marine
      '#FF69B4'  // Rose
    ];

    // Configuration des boutons du menu en haut horizontalement
    const buttonWidth = 150;
    const buttonHeight = 45;
    const buttonMargin = 25;
    const topMargin = 30;

    // Valeurs par défaut pour le reset
    this.defaultValues = {
      letter: 'A',
      color: '#0000FF',
      size: 100,
      rotation: 0
    };

    // Modifier les positions
    this.buttons = [
      { 
        x: buttonMargin, 
        y: topMargin, 
        width: buttonWidth, 
        height: buttonHeight, 
        text: "RANDOM LETTER", 
        action: 'changeLetter'
      },
      { 
        x: buttonMargin * 2 + buttonWidth, 
        y: topMargin, 
        width: buttonWidth, 
        height: buttonHeight, 
        text: "RANDOM COLOR", 
        action: 'changeColor'
      }
    ];

    // Position du slider avec valeur initiale à 100
    this.slider = {
      x: buttonMargin * 3 + buttonWidth * 2,
      y: topMargin,
      width: 150,
      height: buttonHeight,
      minValue: 100,
      maxValue: 300,
      value: 100,
      isActive: false
    };

    // Position de la roue
    this.rotationControl = {
      x: buttonMargin * 4 + buttonWidth * 3 + 30,
      y: topMargin + 25,
      radius: 35,
      minValue: 0,
      maxValue: 360,
      value: 0,
      text: "ROTATION"
    };

    // Nouveau bouton reset à droite de la roue
    this.resetButton = {
      x: this.rotationControl.x + this.rotationControl.radius * 2 + 40,
      y: topMargin,
      width: buttonWidth,
      height: buttonHeight,
      text: "RESET",
      action: 'reset'
    };

    // Ajout d'une couleur principale pour le thème
    this.menuColor = {
      r: 0,
      g: 0,
      b: 255,
      base: 'rgba(0, 0, 255, 0.9)',
      light: 'rgba(0, 0, 255, 0.3)',
      veryLight: 'rgba(0, 0, 255, 0.1)'
    };

    this.hoveredButton = null;
    this.lastHoveredButton = null;
    this.isChangingLetter = false;

    // Ajuster directement la position des éléments sans référence à interfaceBox
    const contentY = 30; // Position Y fixe pour les éléments

    // Mettre à jour les positions Y de tous les éléments
    this.buttons.forEach(button => {
      button.y = contentY;
    });

    this.slider.y = contentY;
    this.rotationControl.y = contentY + 25;
    this.resetButton.y = contentY;
  }

  /**
   * Configure les éléments de base de l'application:
   * - Crée et configure la vidéo pour la webcam
   */
  setupElements() {
    // Création du canvas
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);

    // Création de la vidéo
    this.video = document.createElement("video");
    this.video.autoplay = true;
    document.body.appendChild(this.video);
    // Inverser horizontalement la vidéo uniquement
    this.video.style.transform = 'scaleX(-1)';
  }

  /**
   * Initialise l'application:
   * - Configure la détection des mains avec MediaPipe
   * - Démarre la webcam
   * - Configure les dimensions du canvas quand la vidéo est prête
   */
  async init() {
    try {
      console.log("Chargement de FilesetResolver...");
      const vision = await FilesetResolver.forVisionTasks("./wasm");
      console.log("FilesetResolver chargé avec succès");

      console.log("Création du HandLandmarker...");
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `./hand_landmarker.task`,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      console.log("HandLandmarker créé avec succès");

      console.log("Démarrage de la webcam...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080 },
      });
      this.video.srcObject = stream;
      console.log("Webcam démarrée");

      this.video.addEventListener("loadeddata", () => {
        console.log("Vidéo chargée, configuration du canvas...");
        const { videoWidth, videoHeight } = this.video;
        [this.canvas, this.video].forEach((el) => {
          el.width = videoWidth;
          el.height = videoHeight;
          el.style.width = `${videoWidth}px`;
          el.style.height = `${videoHeight}px`;
        });

        this.draw();
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
    }
  }

  /**
   * Analyse la frame vidéo courante pour détecter les mains et créer les mots correspondantes
   */
  detect() {
    const results = this.handLandmarker.detectForVideo(
      this.video,
      performance.now()
    );

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner le menu
    this.drawMenu();

    // Dessiner la lettre
    this.letterPlacer.drawLetter();

    // Réinitialiser lastHoveredButton si aucun bouton n'est survolé
    if (!this.hoveredButton) {
      this.lastHoveredButton = null;
    }

    if (results.landmarks) {
      results.landmarks.forEach((landmarks, index) => {
        // Structure des doigts et de la paume
        const fingerGroups = [
          [4, 3, 2, 1],    // Pouce
          [8, 7, 6, 5],    // Index
          [12, 11, 10, 9], // Majeur
          [16, 15, 14, 13], // Annulaire
          [20, 19, 18, 17]  // Petit doigt
        ];

        // Points de la paume
        const palmPoints = [0, 1, 5, 9, 13, 17, 0];

        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 2;

        // Dessiner les lignes pour chaque doigt
        fingerGroups.forEach(finger => {
          this.ctx.beginPath();
          for (let i = 0; i < finger.length; i++) {
            const point = landmarks[finger[i]];
            const adjustedX = 1 - point.x;
            if (i === 0) {
              this.ctx.moveTo(adjustedX * this.canvas.width, point.y * this.canvas.height);
            } else {
              this.ctx.lineTo(adjustedX * this.canvas.width, point.y * this.canvas.height);
            }
          }
          this.ctx.stroke();

          // Dessiner les carrés aux points
          finger.forEach(pointIndex => {
            const point = landmarks[pointIndex];
            const adjustedX = 1 - point.x;
            const size = 10;
            this.ctx.strokeRect(
              adjustedX * this.canvas.width - size/2,
              point.y * this.canvas.height - size/2,
              size,
              size
            );
          });
        });

        // Dessiner la paume
        this.ctx.beginPath();
        palmPoints.forEach((pointIndex, i) => {
          const point = landmarks[pointIndex];
          const adjustedX = 1 - point.x;
          if (i === 0) {
            this.ctx.moveTo(adjustedX * this.canvas.width, point.y * this.canvas.height);
          } else {
            this.ctx.lineTo(adjustedX * this.canvas.width, point.y * this.canvas.height);
          }
        });
        this.ctx.stroke();

        // Dessiner les carrés pour les points de la paume
        palmPoints.forEach(pointIndex => {
          if (pointIndex === palmPoints[palmPoints.length - 1]) return;
          const point = landmarks[pointIndex];
          const adjustedX = 1 - point.x;
          const size = 10;
          this.ctx.strokeRect(
            adjustedX * this.canvas.width - size/2,
            point.y * this.canvas.height - size/2,
            size,
            size
          );
        });

        // Vérifier l'interaction avec le slider
        const indexFinger = landmarks[8];
        const adjustedFingerX = (1 - indexFinger.x) * this.canvas.width;
        const fingerY = indexFinger.y * this.canvas.height;

        // Si le doigt est sur le slider
        if (fingerY >= this.slider.y && 
            fingerY <= this.slider.y + this.slider.height &&
            adjustedFingerX >= this.slider.x && 
            adjustedFingerX <= this.slider.x + this.slider.width) {
          
          // Calculer la nouvelle valeur du slider
          const percentage = (adjustedFingerX - this.slider.x) / this.slider.width;
          this.slider.value = this.slider.minValue + (this.slider.maxValue - this.slider.minValue) * percentage;
          
          // Mettre à jour la taille de la lettre
          this.letterPlacer.fontSize = this.slider.value;
        }

        // Gestion du contrôle de rotation
        const centerX = this.rotationControl.x + this.rotationControl.radius;
        const centerY = this.rotationControl.y;
        
        // Calculer la distance entre le doigt et le centre de la roue
        const distance = Math.sqrt(
          Math.pow(adjustedFingerX - centerX, 2) + 
          Math.pow(fingerY - centerY, 2)
        );

        // Si le doigt est proche de la roue
        if (distance <= this.rotationControl.radius + 20) {
          // Calculer l'angle en fonction de la position du doigt
          let angle = Math.atan2(fingerY - centerY, adjustedFingerX - centerX);
          angle = (angle * 180 / Math.PI + 360) % 360;
          
          this.rotationControl.value = angle;
          this.letterPlacer.rotation = angle;
        }

        // Vérifier l'interaction avec les boutons
        this.hoveredButton = null;
        this.buttons.forEach(button => {
          if (this.isPointInButton(adjustedFingerX, fingerY, button)) {
            this.hoveredButton = button;
            this.handleButtonHover(button);
          }
        });

        // Vérifier aussi l'interaction avec le bouton reset
        if (this.isPointInButton(adjustedFingerX, fingerY, this.resetButton)) {
          this.hoveredButton = this.resetButton;
          this.handleButtonHover(this.resetButton);
        }
      });
    }
  }

  /**
   * Lance la boucle d'animation qui détecte et affiche les mains en continu
   */
  draw() {
    this.detect();
    requestAnimationFrame(this.draw.bind(this));
  }

  drawMenu() {
    // Supprimer tout le code qui dessine la boîte englobante et les coins décoratifs
    // Commencer directement avec le dessin des boutons
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.5)`;
    this.ctx.font = 'bold 14px "Arial"';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Dessiner les boutons
    this.buttons.forEach(button => {
      // Effet hover avec fond très subtil
      if (this.hoveredButton === button) {
        this.ctx.fillStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.1)`;
        this.ctx.fillRect(button.x, button.y, button.width, button.height);
      }

      this.ctx.strokeStyle = this.hoveredButton === button 
        ? `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.8)`
        : `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.3)`;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(button.x, button.y, button.width, button.height);

      this.ctx.fillStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.9)`;
      this.ctx.font = 'bold 14px "Arial"';
      this.ctx.fillText(
        button.text,
        button.x + button.width / 2,
        button.y + button.height / 2
      );
    });

    // Dessiner le slider
    // Effet hover pour le slider
    if (this.hoveredButton === this.slider) {
      this.ctx.fillStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.1)`;
      this.ctx.fillRect(this.slider.x, this.slider.y, this.slider.width, this.slider.height);
    }

    this.ctx.strokeStyle = this.hoveredButton === this.slider
      ? `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.8)`
      : `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.3)`;
    this.ctx.strokeRect(this.slider.x, this.slider.y, this.slider.width, this.slider.height);

    // Ligne de progression du slider
    const percentage = (this.slider.value - this.slider.minValue) / (this.slider.maxValue - this.slider.minValue);
    const cursorX = this.slider.x + (this.slider.width * percentage);
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.8)`;
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(this.slider.x, this.slider.y + this.slider.height/2);
    this.ctx.lineTo(cursorX, this.slider.y + this.slider.height/2);
    this.ctx.stroke();

    // Curseur
    this.ctx.beginPath();
    this.ctx.arc(cursorX, this.slider.y + this.slider.height/2, 8, 0, Math.PI * 2);
    this.ctx.strokeStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.5)`;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Texte "SIZE" et valeur
    this.ctx.font = 'bold 14px "Arial"';
    this.ctx.fillStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.9)`;
    this.ctx.fillText(
      `SIZE ${Math.round(this.slider.value)}`,
      this.slider.x + this.slider.width/2,
      this.slider.y + this.slider.height/2
    );

    // Dessiner le bouton reset
    // Effet hover pour le reset
    if (this.hoveredButton === this.resetButton) {
      this.ctx.fillStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.1)`;
      this.ctx.fillRect(
        this.resetButton.x, 
        this.resetButton.y, 
        this.resetButton.width, 
        this.resetButton.height
      );
    }

    this.ctx.strokeStyle = this.hoveredButton === this.resetButton
      ? `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.8)`
      : `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.3)`;
    this.ctx.strokeRect(
      this.resetButton.x, 
      this.resetButton.y, 
      this.resetButton.width, 
      this.resetButton.height
    );

    this.ctx.fillStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.9)`;
    this.ctx.fillText(
      this.resetButton.text,
      this.resetButton.x + this.resetButton.width/2,
      this.resetButton.y + this.resetButton.height/2
    );

    // Puis dessiner la roue de rotation
    const centerX = this.rotationControl.x + this.rotationControl.radius;
    const centerY = this.rotationControl.y;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.rotationControl.radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.3)`;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.rotationControl.radius - 5, 0, Math.PI * 2);
    this.ctx.strokeStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.2)`;
    this.ctx.stroke();

    const angle = (this.rotationControl.value * Math.PI) / 180;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(
      centerX + Math.cos(angle) * this.rotationControl.radius,
      centerY + Math.sin(angle) * this.rotationControl.radius
    );
    this.ctx.strokeStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.9)`;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(${this.menuColor.r}, ${this.menuColor.g}, ${this.menuColor.b}, 0.9)`;
    this.ctx.fill();

    this.ctx.font = 'bold 12px "Arial"';
    this.ctx.fillText(
      `${Math.round(this.rotationControl.value)}°`,
      centerX,
      centerY + this.rotationControl.radius + 20
    );

    // Réinitialiser les effets d'ombre
    this.ctx.shadowBlur = 0;
  }

  isPointInButton(x, y, button) {
    return x >= button.x && 
           x <= button.x + button.width && 
           y >= button.y && 
           y <= button.y + button.height;
  }

  handleButtonHover(button) {
    if (this.lastHoveredButton !== button) {
      this.lastHoveredButton = button;
      
      switch(button.action) {
        case 'changeLetter':
          if (!this.isChangingLetter) {
            this.isChangingLetter = true;
            this.letterPlacer.letter = '';
            setTimeout(() => {
              let newLetter;
              do {
                newLetter = this.possibleLetters[Math.floor(Math.random() * this.possibleLetters.length)];
              } while (newLetter === this.letterPlacer.letter);
              this.letterPlacer.letter = newLetter;
              this.isChangingLetter = false;
            }, 100);
          }
          break;

        case 'changeColor':
          let newColor;
          do {
            newColor = this.possibleColors[Math.floor(Math.random() * this.possibleColors.length)];
          } while (newColor === this.letterPlacer.color);
          this.letterPlacer.color = newColor;
          break;

        case 'reset':
          // Animation de reset
          this.isResetting = true;
          
          // Effet de flash sur le bouton reset
          button.flashEffect = true;
          setTimeout(() => {
            button.flashEffect = false;
          }, 200);

          // Reset de toutes les valeurs
          this.letterPlacer.letter = this.defaultValues.letter;
          this.letterPlacer.color = this.defaultValues.color;
          this.letterPlacer.fontSize = this.defaultValues.size;
          this.letterPlacer.rotation = this.defaultValues.rotation;
          
          // Reset des contrôles
          this.slider.value = this.defaultValues.size;
          this.rotationControl.value = this.defaultValues.rotation;
          
          this.isResetting = false;
          break;
      }
    }
  }
}
