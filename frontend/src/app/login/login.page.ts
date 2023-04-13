import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {GoogleService} from "../google.service";
import {Observable, Subject} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  sessionData: Observable<any> = new Subject<any>();

  constructor(private gAuth: GoogleService) { }

  ngOnInit() {
  }


  async signInWithGoogle(){
    await this.gAuth.signIn();
  }


  getActivities(){
    const today = new Date().toISOString();
    const aWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
    this.sessionData = this.gAuth.getActivities(aWeekAgo, today);
  }


  async refresh(){
    await this.gAuth.refresh();
  }


  async signOut(){
    await this.gAuth.signOut();
  }
}
