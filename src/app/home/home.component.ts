import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../services/web-socket.service';
import { DataSharingService } from '../services/data-sharing.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  activeTab: string = 'Mediapipe Settings';
  public joint: string = "stop"
  public jointImage: string = "../../assets/images/a.png"


  public maxNumHands: number = 1;
  public modelComplexity: 0 | 1 = 1;
  public minDetectionConfidence: number = 0.8;
  public minTrackingConfidence: number = 0.8;
  public selfieMode: boolean = false;
  public speed: number = 15;
  public fps: number = 0;

  private ttsSubscription!: Subscription;
  public tts: number = 0;
  constructor(private dataSharingService: DataSharingService, private wsService: WebSocketService) { }
  ngAfterViewInit(): void {

  }
  ngOnInit(): void {

    this.ttsSubscription = this.wsService.tts$.subscribe(tts => {
      this.tts = tts;
    });


    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.code === "Digit1") {
        this.jointImage = "../../assets/images/a.png";
        this.joint = "base";

      } else if (event.code === "Digit2") {
        this.jointImage = "../../assets/images/b.png";
        this.joint = "axis1";

      }
      else if (event.code === "Digit3") {
        this.jointImage = "../../assets/images/c.png";
        this.joint = "axis2";

      }
      else if (event.code === "Digit4") {
        this.jointImage = "../../assets/images/d.png";
        this.joint = "rotation";

      }
      else if (event.code === "Digit5") {
        this.jointImage = "../../assets/images/e.png";
        this.joint = "up_down";

      }
      else if (event.code === "Digit6") {
        this.jointImage = "../../assets/images/f.png";
        this.joint = "gripper";

      }

    });
  }



  onDataReceived(fps: number) {
    this.fps = fps;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  sendSpeed() {
    this.dataSharingService.sendData(this.speed);
  }
  ngOnDestroy(): void {
    this.ttsSubscription.unsubscribe();
  }
}
