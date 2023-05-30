import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-joints',
  templateUrl: './joints.component.html',
  styleUrls: ['./joints.component.css']
})
export class JointsComponent {
  @Input() public jointImage: string = "../../assets/images/a.png";

}
