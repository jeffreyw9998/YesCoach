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

  constructor() { }

  ngOnInit() {}

}
