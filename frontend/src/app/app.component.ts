import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {GoogleService} from "./google.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AppComponent {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(private readonly googleAuthService: GoogleService) {
    googleAuthService.initialize().then(() => {
      console.log('GoogleAuth initialized.')
    });

    if (this.googleAuthService.user === null){
      // Redirect to login
    }
  }
}
