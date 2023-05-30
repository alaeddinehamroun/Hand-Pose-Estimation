import { Move } from "./move.model";

export class Sequence {
  constructor(
      public name: string = "New Serie",
      public date: Date = new Date(),
      public playing: boolean = false,
      public color: string = "black",
      public moves : Move[]= []
  ) {}

}
