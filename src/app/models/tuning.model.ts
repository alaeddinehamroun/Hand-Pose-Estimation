export class Tuning {
  constructor(
      public maxNumHands: number = 1,
      public modelComplexity: number = 1,
      public minDetectionConfidence: number = 0.8,
      public minTrackingConfidence: number = 0.8,
      public selfieMode: boolean = false
  ) {}

}
