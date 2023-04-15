import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {GoogleService} from "../../services/gService/google.service";
import {Observable, Subject} from "rxjs";
import {Router} from "@angular/router";
import {ApiService} from "../../services/apiservice/api.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  sessionData: Observable<any> = new Subject<any>();

  constructor(private gAuth: GoogleService,
              private readonly router: Router,
              private readonly apiService: ApiService) { }

  ngOnInit() {
  }


  async signInWithGoogle(){
    await this.gAuth.signIn();

    // Redirect to register page if user is not registered in database
    if (!this.apiService.userExists(this.gAuth.user!.uid)){
      await this.router.navigate(['/register']);
    }
    else{
      await this.router.navigate(['/']);
    }
    // Redirect to home otherwise
  }


  async refresh(){
    await this.gAuth.refresh();
  }


  async signOut(){
    await this.gAuth.signOut();
  }
}
