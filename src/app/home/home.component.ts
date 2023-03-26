import { AfterContentChecked, AfterViewInit, Component, DoCheck, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Hands, Results, HAND_CONNECTIONS, Options } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils'
import { WebSocketService } from '../services/web-socket.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit, DoCheck {

  private ws!: WebSocket;
  public message!: any;
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private options: Options = {
    selfieMode: false,
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  }
  private hands!: Hands;

  public maxNumHands: number = 1;
  public modelComplexity: 0 | 1 = 1;
  public minDetectionConfidence: number = 0.5;
  public minTrackingConfidence: number = 0.5;
  public selfieMode: boolean = false;

  public loaded = true;

  constructor(private webSocketService: WebSocketService) { }
  ngDoCheck(): void {
    if (this.maxNumHands !== this.options.maxNumHands) {
      this.loaded = false
      this.options.maxNumHands = this.maxNumHands
      this.hands.setOptions(this.options)
    }

    if (this.modelComplexity !== this.options.modelComplexity) {
      this.options.modelComplexity = this.modelComplexity
      this.hands.setOptions(this.options)
    }

    if (this.minDetectionConfidence !== this.options.minDetectionConfidence) {
      this.options.minDetectionConfidence = this.minDetectionConfidence
      this.hands.setOptions(this.options)
    }

    if (this.minTrackingConfidence !== this.options.minTrackingConfidence) {
      this.options.minTrackingConfidence = this.minTrackingConfidence
      this.hands.setOptions(this.options)
    }

    if (this.selfieMode !== this.options.selfieMode) {
      this.options.selfieMode = this.selfieMode
      this.hands.setOptions(this.options)
    }
  }
  ngOnInit(): void {
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });
    this.hands.setOptions(this.options);

    this.webSocketService.connect()

    // Handle incoming messages
    this.webSocketService.onMessage().subscribe((message: any) => {
      this.message = message;
      console.log("Received message: "+this.message)
    });

  }


  ngAfterViewInit() {

    const videoElement = this.video.nativeElement;
    const canvasElement = this.canvas.nativeElement
    const canvasCtx = canvasElement.getContext("2d");


    this.hands.onResults((results: Results) => {

      this.loaded = true;

      canvasCtx!.save();
      canvasCtx!.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx!.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
      if (results.multiHandLandmarks.length>0) {
        this.webSocketService.send(results.multiHandLandmarks)
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
