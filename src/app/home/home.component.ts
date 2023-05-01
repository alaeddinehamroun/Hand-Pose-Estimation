import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public maxNumHands: number = 1;
  public modelComplexity: 0 | 1 = 1;
  public minDetectionConfidence: number = 0.8;
  public minTrackingConfidence: number = 0.8;
  public selfieMode: boolean = false;
  public fps: number = 0;

  private ttsSubscription!: Subscription;
  public tts: number =0;
  constructor(private wsService: WebSocketService) { }
  ngOnInit(): void {

    this.ttsSubscription = this.wsService.tts$.subscribe(tts => {
      this.tts = tts;
    });
  }

  onDataReceived(fps: number) {
    this.fps = fps;
  }
  ngOnDestroy(): void {
    this.ttsSubscription.unsubscribe();
  }
}
