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


  @Input() inputValue: number = 1;
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  options: any
  hands!: Hands
  ngOnInit(): void {


  }
  getInputValue(){
    return this.inputValue
  }
  modifier(newValue: any) {
    this.inputValue=newValue;

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
