import { Component, OnInit } from '@angular/core';
import { Sequence } from '../models/sequence.model';
import { Move } from '../models/move.model';
import { DataSharingService } from '../services/data-sharing.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-sequences',
  templateUrl: './sequences.component.html',
  styleUrls: ['./sequences.component.css']
})
export class SequencesComponent implements OnInit {


  public sequences: Sequence[] = []
  public tempSerie: Sequence = new Sequence();
  public delaying: boolean = false;
  public tempDate: Date = new Date();
  public saving: boolean = false;
  public moving: boolean = false;
  public tempName: string = "My Serie";
  public tempMove: Move = new Move(0, 0, 0, 0, 0, 0, 0);
  public playingSerie: Sequence = new Sequence();
  public subscription: Subscription = new Subscription();

  constructor(private dataSharingService: DataSharingService) {

    this.subscription = this.dataSharingService.getData().subscribe(value => {
      if (value.constructor.name == "Move") {
        if (value.base != 0) {
          this.tempMove.base = value.base
        }
        if (value.axis1 != 0) {
          this.tempMove.axis1 = value.axis1
        }
        if (value.axis2 != 0) {
          this.tempMove.axis2 = value.axis2
        }
        if (value.rotation != 0) {
          this.tempMove.rotation = value.rotation
        }
        if (value.up_down != 0) {
          this.tempMove.up_down = value.up_down
        }
        if (value.gripper != 0) {
          this.tempMove.gripper = value.gripper
        }
      }
    });

  }

  ngOnInit(): void {
    this.sequences.push(new Sequence("Serie1", new Date, false, this.getRandomColor(), []));
    this.sequences.push(new Sequence("Serie2", new Date, false, this.getRandomColor(), []));

  }

  toggleMoving() {
    this.moving = !this.moving;
    if (this.delaying) {
      this.createDelay();
    }
    this.delaying = false;
    if (!this.moving) {
      this.createMove()
    }
  }

  toggleDelaying() {
    this.delaying = !this.delaying;
    if (this.moving) {
      this.createMove()
    }
    this.moving = false;
    if (!this.delaying) {
      this.createDelay();
    } else {
      this.tempDate = new Date();

    }
  }

  getRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  getDelayText() {
    if (this.delaying) {
      return (new Date().getTime() - this.tempDate.getTime()).toString();
    } else {
      return "Delay"
    }
  }

  createDelay() {
    this.tempMove.base = 0;
    this.tempMove.axis1 = 0;
    this.tempMove.axis2 = 0;
    this.tempMove.rotation = 0;
    this.tempMove.up_down = 0;
    this.tempMove.gripper = 0;

    this.tempMove.delay = new Date().getTime() - this.tempDate.getTime();
    this.tempSerie.moves.push(Object.assign(new Move(), this.tempMove));
  }

  createMove() {
    this.tempMove.delay = 0;
    this.tempSerie.moves.push(Object.assign(new Move(), this.tempMove));
  }

  setSerie() {
    if (this.delaying) {
      this.createDelay()
    }

    if (this.moving) {
      this.createMove();
    }

    this.tempSerie.color = this.getRandomColor();
    this.sequences.push(Object.assign(new Sequence(), this.tempSerie));
    this.setSaving(false);
  }
  setSaving(state: boolean) {
    for (let i = 0; i < this.sequences.length; i++) {
      this.sequences[i].playing = false;
    }

    this.saving = state;
    if (!state) {
      this.delaying = false;
      this.moving = false;
      this.tempSerie = new Sequence();
    }
  }

  playSerie(index: number) {
    for (let i = 0; i < this.sequences.length; i++) {
      this.sequences[i].playing = false;
    }

    this.sequences[index].playing = true;
    this.playingSerie = this.sequences[index];
    this.dataSharingService.sendData(this.playingSerie);
  }

  endSerie(index: number) {
    this.sequences[index].playing = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
