import { Component } from '@angular/core';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public maxNumHands: number = 1;
  public modelComplexity: 0 | 1 = 1;
  public minDetectionConfidence: number = 0.8;
  public minTrackingConfidence: number = 0.8;
  public selfieMode: boolean = false;

  constructor() { }

}
