import BaseApp from "./BaseApp";

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = Math.random() * Math.PI * 2;
    this.baseRadius = 50 + Math.random() * 100;
    this.radius = this.baseRadius;
    this.speed = 0.005 + Math.random() * 0.005;
    this.baseSize = 10 + Math.random() * 20;
    this.size = this.baseSize;
    this.frequencyIndex = Math.floor(Math.random() * 100);
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.letter = letters[Math.floor(Math.random() * letters.length)];
    this.rotation = Math.random() * Math.PI * 2;
  }

  update(dataFrequency) {
    const frequency = dataFrequency[this.frequencyIndex];
    this.angle += this.speed * (1 + frequency / 256);
    this.radius = this.baseRadius * (1 + frequency / 128);
    this.size = this.baseSize * (1 + frequency / 128);
    this.x = Math.cos(this.angle) * this.radius;
    this.y = Math.sin(this.angle) * this.radius;
    this.rotation += 0.005 * (frequency / 256);
  }
}

export default class App extends BaseApp {
  constructor() {
    super();
    this.audioFile = "./audio/musique.mp3";
    this.audio = new Audio(this.audioFile);
    this.particles = Array.from({ length: 100 }, () => new Particle(0, 0));
    this.init();
  }
  init() {
    document.addEventListener("click", (e) => {
      this.play(e);
    });
    document.addEventListener("keydown", (e) => {
      console.log(e);
      this.audio.pause();
      this.isPlaying = false;
    });
  }

  initAudioContext() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.initBroadcast();
    this.setupAnalyser();
  }

  initBroadcast() {
    this.source = this.audioContext.createMediaElementSource(this.audio);
  }

  setupAnalyser() {
    this.analyser = this.audioContext.createAnalyser();
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    console.log(this.audioContext.destination);
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataFrequency = new Uint8Array(this.bufferLength);
    this.dataFloatFrequency = new Float32Array(this.bufferLength);
    this.dataWave = new Uint8Array(this.bufferLength);
    this.draw();
  }
  updateWaveForm() {
    this.analyser.getByteTimeDomainData(this.dataWave);
  }
  updateFrequency() {
    this.analyser.getByteFrequencyData(this.dataFrequency);
  }
  updatedFloatFrequency() {
    this.analyser.getFloatFrequencyData(this.dataFloatFrequency);
  }
  play(mouse) {
    if (!this.isPlaying) {
      if (!this.audioContext) {
        this.initAudioContext();
      }
      this.audio.play();
      this.isPlaying = true;
    } else {
      let timeToStart =
        (mouse.clientX / window.innerWidth) * this.audio.duration;
      this.audio.currentTime = timeToStart;
    }
  }

  draw() {
    const { ctx, width, height } = this;

    this.updateWaveForm();
    this.updateFrequency();
    this.updatedFloatFrequency();

    const dataFrequency = this.dataFrequency;

    if (this.isPlaying) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Cercle avec opacité réduite pour effet de profondeur
        ctx.globalAlpha = 0.3;
        ctx.globalCompositeOperation = "destination-over";

        let offset = 150;
        let offsetFreq = 40;
        let range = this.bufferLength - (offset + offsetFreq);
        let angle = (Math.PI * 1) / range;
        
        ctx.beginPath();
        for (let i = 0; i < range; i++) {
            const freq = dataFrequency[i + offsetFreq];
            const radius = height / 4 + freq * 0.5;
            const x = Math.cos(angle * i) * radius;
            const y = Math.sin(angle * i) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        for (let i = range; i > 0; i--) {
            const freq = dataFrequency[i + offsetFreq];
            const radius = height / 4 + freq * 0.5;
            const x = Math.cos(-angle * i) * radius;
            const y = Math.sin(-angle * i) * radius;
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Réinitialisation des paramètres de composition pour les lettres
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        // Dessin des particules-lettres au premier plan
        this.particles.forEach(particle => {
            particle.update(dataFrequency);
            
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            
            ctx.font = `${particle.size}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            ctx.globalCompositeOperation = "lighter";
            
            const intensity = dataFrequency[particle.frequencyIndex] / 255;
            ctx.fillStyle = `rgba(0, 0, 255, ${intensity})`;
            
            ctx.fillText(particle.letter, 0, 0);
            
            ctx.restore();
        });

        ctx.restore();
    }

    requestAnimationFrame(this.draw.bind(this));
  }
}
