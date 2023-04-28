import {Component, OnInit} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class HomePage implements OnInit{


  basicStats = {
    steps: 0,
    miles: 0,
    sleepHours: 0,
    burnedCalories: 0,
  }

  ngOnInit(): void {
    // Load data here
  }
  constructor() {}
  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 500);
  };

}
