import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit {

  private ws!: WebSocket;
  public message!: any;
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  options: any
  hands!: Hands
  ngOnInit(): void {
    this.ws = new WebSocket('ws://localhost:3000');

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.ws.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
      this.message = event.data;
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

  }
  public sendMessage() {
    this.ws.send(this.message);
    console.log(`Sent message: ${this.message}`);
  }


  ngAfterViewInit() {
    this.options = {
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    }
    const videoElement = this.video.nativeElement;
    const canvasElement = this.canvas.nativeElement
    const canvasCtx = canvasElement.getContext("2d");



    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });
    this.hands.setOptions(this.options);

    this.hands.onResults((results) => {
      // this.message= results.multiHandLandmarks[0][0]['x'].toString()
      // this.sendMessage()
      // console.log(this.message)
      canvasCtx!.save();
      canvasCtx!.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx!.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx!, landmarks, HAND_CONNECTIONS,
            { color: '#00FF00', lineWidth: 5 });
          drawLandmarks(canvasCtx!, landmarks, { color: '#FF0000', lineWidth: 2 });
        }
      }
      canvasCtx!.restore();
    });
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720
    });
    camera.start();

  }
}
