import { AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Hands, Results, HAND_CONNECTIONS, Options } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils'
import { WebSocketService } from '../services/web-socket.service';
import { Subscription } from 'rxjs';
import { Sequence } from '../models/sequence.model';
import { DataSharingService } from '../services/data-sharing.service';
import { Move } from '../models/move.model';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css']
})


export class OperatorComponent implements OnInit, AfterViewInit, OnChanges {


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
  @Input() public joint: string = "stop";
  @Input() public toggleMediapipe!: boolean

  @Output() sendFps: EventEmitter<number> = new EventEmitter<number>();

  public subscription: Subscription = new Subscription();
  public playingSerie: Sequence = new Sequence();
  public cursor: number = 0;
  public isDelay: boolean = false;
  public startDelay: Date = new Date();
  public move: Move = new Move(0, 0, 0, 0, 0, 0, 0);


  public loaded = false;
  constructor(private webSocketService: WebSocketService, private dataSharingService: DataSharingService) {
    this.subscription = this.dataSharingService.getData().subscribe(value => {
      if (value.constructor.name == "Sequence") {
        this.cursor = 0;
        this.playingSerie = value;
      }
      else if (value.constructor.name == "Number") {
        this.webSocketService.send("#" + value.toString() + "\n");
      }
    });
  }
  sendData(): void {
    this.dataSharingService.sendData(this.move);
  }
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

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.code === "ArrowRight") {
        if (this.joint == "base") {
          this.move.base += 5;

        }
        if (this.joint == "rotation") {
          this.move.rotation += 5;
        }
        if (this.joint == "gripper") {
          this.move.gripper += 5;
        }

      }
      else if (event.code === "ArrowLeft") {

        if (this.joint == "base") {
          this.move.base -= 5;
        }
        if (this.joint == "rotation") {
          this.move.rotation -= 5;
        }
        if (this.joint == "gripper") {
          this.move.gripper -= 5;
        }
      }
      else if (event.code === "ArrowUp") {

        if (this.joint == "axis1") {
          this.move.axis1 += 5;
        }
        if (this.joint == "axis2") {
          this.move.axis2 += 5;
        }
        if (this.joint == "up_down") {
          this.move.up_down += 5;
        }

      }
      else if (event.code === "ArrowDown") {

        if (this.joint == "axis1") {
          this.move.axis1 -= 5;
        }
        if (this.joint == "axis2") {
          this.move.axis2 -= 5;
        }
        if (this.joint == "up_down") {
          this.move.up_down -= 5;
        }
      }

      const sent = [
        this.move.base,
        this.move.axis1,
        this.move.axis2,
        this.move.rotation,
        this.move.up_down,
        this.move.gripper,
      ]

      this.webSocketService.send(sent)


    });
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



      if (this.playingSerie.playing) {

        if (this.playingSerie.moves.length == 0) {
          this.playingSerie.moves.push(new Move(0, 0, 0, 0, 0, 0, 0))
        }
        // console.log(this.playingSerie.name , "  ", this.cursor, " move", this.playingSerie.moves[this.cursor]);

        if (this.playingSerie.moves[this.cursor].delay != 0) {
          if (this.isDelay == false) {
            this.startDelay = new Date()
          }
          this.isDelay = true;


          if (((new Date).getTime() - this.startDelay.getTime()) > this.playingSerie.moves[this.cursor].delay) {
            if (this.cursor < (this.playingSerie.moves.length - 1)) {
              this.cursor++;
            }
          }

        } else {
          this.isDelay = false;

          const sent = [
            this.playingSerie.moves[this.cursor].base,
            this.playingSerie.moves[this.cursor].axis1,
            this.playingSerie.moves[this.cursor].axis2,
            this.playingSerie.moves[this.cursor].rotation,
            this.playingSerie.moves[this.cursor].up_down,
            this.playingSerie.moves[this.cursor].gripper,
          ]


          this.webSocketService.send(sent);
          if (this.cursor < (this.playingSerie.moves.length - 1)) {
            this.cursor++;

          }



          // Move
          // axis1
          // :
          // 65
          // axis2
          // :
          // 45
          // base
          // :
          // -23
          // delay
          // :
          // 0
          // gripper
          // :
          // 38
          // rotation
          // :
          // 52
          // up_down
          // :
          // 145
        }






      } else {
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

          const index_finger_pip = {
            x: results.multiHandLandmarks[0][6].x,
            y: results.multiHandLandmarks[0][6].y,
            z: results.multiHandLandmarks[0][6].z
          }

          const index_finger_dip = {
            x: results.multiHandLandmarks[0][7].x,
            y: results.multiHandLandmarks[0][7].y,
            z: results.multiHandLandmarks[0][7].z
          }



          const index_finger_mcp = {
            x: results.multiHandLandmarks[0][5].x,
            y: results.multiHandLandmarks[0][5].y,
            z: results.multiHandLandmarks[0][5].z
          }

          const pinky_mcp = {
            x: results.multiHandLandmarks[0][17].x,
            y: results.multiHandLandmarks[0][17].y,
            z: results.multiHandLandmarks[0][17].z
          }

          const middle_finger_tip =
          {
            x: results.multiHandLandmarks[0][12].x,
            y: results.multiHandLandmarks[0][12].y,
            z: results.multiHandLandmarks[0][12].z
          }
          const landmarks = [
            wrist_landmark,
            thumb_tip_landmark,
            index_finger_tip_landmark,
            index_finger_dip,
            index_finger_pip,
            index_finger_mcp,
            pinky_mcp,
            middle_finger_tip,


          ]


          const distance = ((thumb_tip_landmark.x - index_finger_tip_landmark.x) ** 2 + (thumb_tip_landmark.y - index_finger_tip_landmark.y) ** 2) ** 0.5
          const rotation = (index_finger_mcp.x - pinky_mcp.x)
          const up_n_down = index_finger_mcp.z
          const axis1 = ((index_finger_pip.x - index_finger_mcp.x) ** 2 + (index_finger_pip.y - index_finger_mcp.y) ** 2) ** 0.5
          // const axis2 = ((middle_finger_tip.x - wrist_landmark.x) ** 2 + (middle_finger_tip.y - wrist_landmark.y) ** 2) ** 0.5
          const axis2 = (wrist_landmark.y - middle_finger_tip.y)

          var baseToSend = Math.trunc(rotation * 100);
          baseToSend = baseToSend != 0 ? baseToSend : 1;

          var axis1ToSend = Math.trunc(axis1 * 100);
          axis1ToSend = axis1ToSend != 0 ? axis1ToSend : 1;

          var axis2ToSend = Math.trunc(axis2 * 1000);
          axis2ToSend = axis2ToSend != 0 ? axis2ToSend : 1;

          var rotationToSend = Math.trunc(rotation * 1000);
          rotationToSend = rotationToSend != 0 ? rotationToSend : 1;

          var up_downToSend = Math.trunc(up_n_down * 100);
          up_downToSend = up_downToSend != 0 ? up_downToSend : 1;

          var gripperToSend = Math.trunc(distance * 100);
          gripperToSend = gripperToSend != 0 ? gripperToSend : 1;


          if (this.toggleMediapipe == true) {



            this.move.base = this.joint == "base" ? rotationToSend : 0;
            this.move.axis1 = this.joint == "axis1" ? axis2ToSend : 0;
            this.move.axis2 = this.joint == "axis2" ? axis2ToSend : 0;
            this.move.rotation = this.joint == "rotation" ? rotationToSend : 0;
            this.move.up_down = this.joint == "up_down" ? axis2ToSend : 0;
            this.move.gripper = this.joint == "gripper" ? gripperToSend : 0;

            this.sendData(); this.playingSerie.playing

            const sent = [
              this.move.base,
              this.move.axis1,
              this.move.axis2,
              this.move.rotation,
              this.move.up_down,
              this.move.gripper,
            ]


            this.webSocketService.send(sent)

            drawConnectors(canvasCtx!, landmarks, HAND_CONNECTIONS,
              { color: '#00FF00', lineWidth: 5 });
            drawLandmarks(canvasCtx!, landmarks, { color: '#FF0000', lineWidth: 2 });

          }
        }
      }
      canvasCtx!.restore();
    });


    const camera = new Camera(videoElement, {
      onFrame: async () => {
        const startTime = performance.now();
        await this.hands.send({ image: videoElement });
        const endTime = performance.now();
        const fps = Math.round(1000 / (endTime - startTime));
        this.sendFps.emit(fps)
        //console.log(`FPS: ${fps}`);
        //console.log(`Processing time: ${(endTime - startTime)/1000}`)
      },
      width: 1280,
      height: 720
    });
    camera.start();
  }



}
