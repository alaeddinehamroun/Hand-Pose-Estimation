import { AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Hands, Results, HAND_CONNECTIONS, Options } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils'
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css']
})


export class OperationComponent implements OnInit, AfterViewInit, OnChanges {


  public message!: any;
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private options: Options = {
    selfieMode: false,
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8
  }
  private hands!: Hands;

  @Input() public maxNumHands: number = 1;
  @Input() public modelComplexity: 0 | 1 = 1;
  @Input() public minDetectionConfidence: number = 0.5;
  @Input() public minTrackingConfidence: number = 0.5;
  @Input() public selfieMode: boolean = false;

  public loaded = false;
  @Input('mydiv') public mydiv: any
  constructor(private webSocketService: WebSocketService) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.loaded) {
      if (changes['maxNumHands']) {
        this.options.maxNumHands = this.maxNumHands
        this.hands.setOptions(this.options)
      }
      if (changes['modelComplexity']) {
        this.options.modelComplexity = this.modelComplexity
        this.hands.setOptions(this.options)

      }
      if (changes['minDetectionConfidence']) {
        this.options.minDetectionConfidence = this.minDetectionConfidence
        this.hands.setOptions(this.options)
      }
      if (changes['minTrackingConfidence']) {
        this.options.minTrackingConfidence = this.minTrackingConfidence
        this.hands.setOptions(this.options)
      }
      if (changes['selfieMode']) {
        this.options.selfieMode = this.selfieMode
        this.hands.setOptions(this.options)
      }
    }
  }

  ngOnInit(): void {
    console.log(this.minDetectionConfidence)
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
      console.log("Received message: " + this.message)
    });

  }

  private registerDragElement() {
    const elmnt = document.getElementById(this.mydiv);

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    const dragMouseDown = (e: any) => {
      e = e || window.event;
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e: any) => {
      e = e || window.event;
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt!.style.top = elmnt!.offsetTop - pos2 + 'px';
      elmnt!.style.left = elmnt!.offsetLeft - pos1 + 'px';
    };

    const closeDragElement = () => {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    };

    if (document.getElementById(elmnt!.id + 'header')) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById(elmnt!.id + 'header')!.onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      elmnt!.onmousedown = dragMouseDown;
    }
  }

  public allowDrop(ev: any): void {
    ev.preventDefault();
  }

  public drag(ev: any): void {
    ev.dataTransfer.setData("text", ev.target.id);
  }

  public drop(ev: any): void {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
  }

  ngAfterViewInit() {

    const videoElement = this.video.nativeElement;
    const canvasElement = this.canvas.nativeElement
    const canvasCtx = canvasElement.getContext("2d");
    this.registerDragElement();

    this.hands.onResults((results: Results) => {

      this.loaded = true;

      canvasCtx!.save();
      canvasCtx!.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx!.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
      if (results.multiHandLandmarks.length > 0) {

        // Get wrist landmark from first hand
        const wrist_landmark = {
          x: results.multiHandLandmarks[0][0].x,
          y: results.multiHandLandmarks[0][0].y,
          z: results.multiHandLandmarks[0][0].z
        }
        // Get thumb_tip landmark from first hand
        const thumb_tip_landmark = {
          x: results.multiHandLandmarks[0][4].x,
          y: results.multiHandLandmarks[0][4].y,
          z: results.multiHandLandmarks[0][4].z
        }
        // Get index_finger_tip landmark from first hand
        const index_finger_tip_landmark = {
          x: results.multiHandLandmarks[0][8].x,
          y: results.multiHandLandmarks[0][8].y,
          z: results.multiHandLandmarks[0][8].z
        }

        const landmarks = [
          wrist_landmark,
          thumb_tip_landmark,
          index_finger_tip_landmark
        ]
        this.webSocketService.send(landmarks)

        // drawConnectors(canvasCtx!, landmarks, HAND_CONNECTIONS,
        //   { color: '#00FF00', lineWidth: 5 });
        drawLandmarks(canvasCtx!, landmarks, { color: '#FF0000', lineWidth: 2 });

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
