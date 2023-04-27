import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ExploreContainerComponent} from "../explore-container/explore-container.component";

@Component({
  selector: 'app-hydration',
  templateUrl: './hydration.component.html',
  styleUrls: ['./hydration.component.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent]
})
export class Hydration implements OnInit {

  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  };

  ngOnInit() {}

}
