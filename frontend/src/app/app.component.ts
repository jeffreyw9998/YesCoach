import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {GoogleService} from "./services/gService/google.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AppComponent {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(private readonly googleAuthService: GoogleService,
              private readonly router: Router) {
    googleAuthService.initialize().then(() => {
      console.log('GoogleAuth initialized.')
    });

  }
}
