import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tuning } from '../models/tuning.model';

@Component({
  selector: 'app-mediapipe-settings',
  templateUrl: './mediapipe-settings.component.html',
  styleUrls: ['./mediapipe-settings.component.css']
})
export class MediapipeSettingsComponent {

  @Input() public maxNumHands: number = 1;
  @Input() public modelComplexity: number = 1;
  @Input() public minDetectionConfidence: number = 0.8;
  @Input() public minTrackingConfidence: number = 0.8;
  @Input() public selfieMode: boolean = true;
  @Output() itemEvent = new EventEmitter<Tuning>();

  constructor() {
  }

  sendParams() {
    const tuning = new Tuning(
      this.maxNumHands,
      this.modelComplexity,
      this.minDetectionConfidence,
      this.minTrackingConfidence,
      this.selfieMode
    );
    this.itemEvent.emit(tuning);
  }
}
