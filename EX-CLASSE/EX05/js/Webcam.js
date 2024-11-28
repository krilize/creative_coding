export default class Webcam {
  constructor() {
    this.video = document.createElement("video");
    this.video.width = 1920;
    this.video.height = 1080;
    // get user media
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1920, height: 1080 } })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.play();
      });
  }
}
