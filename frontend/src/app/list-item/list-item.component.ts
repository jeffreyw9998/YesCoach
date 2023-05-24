import {Component, Input, OnInit} from '@angular/core';
import {Exercise} from "../types/recommendation";
import {CommonModule} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {ApiService} from "../services/apiservice/api.service";

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ListItemComponent  implements OnInit {

  @Input() exercise: Exercise = {
    name: '',
    url: '',
    checked: false
  }
  @Input() goalIsGainMuscle = false;
  @Input() index: number = 0;
  @Input() userId: string = '';
  constructor(private apiService: ApiService) { }

  ngOnInit() {}

  handleChange(ev: any) {
    if (ev.target.checked && !this.exercise.checked) {
      // Call api here if condition is met
      if (this.goalIsGainMuscle){
        this.apiService.postMuscleChoice(this.userId, this.exercise).subscribe({
          next: (res) => {
            if (res.detail.startsWith('Successfully')){
              this.exercise.checked = true;
            }
          },
          error: (err) => {
            console.log(err);
          }
        })
      }
    }
  }
}
