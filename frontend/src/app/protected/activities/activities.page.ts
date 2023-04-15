import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-activities',
  templateUrl: 'activities.page.html',
  styleUrls: ['activities.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent]
})
export class ActivitiesPage {

  constructor() {}

}
