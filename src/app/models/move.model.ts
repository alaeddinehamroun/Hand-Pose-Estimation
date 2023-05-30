export class Move {
  constructor(
      public base: number = 90,
      public axis1: number = 90,
      public axis2: number = 90,
      public rotation: number = 90,
      public up_down: number = 90,
      public gripper: number = 90,
      public delay: number = 0
  ) {}

}
