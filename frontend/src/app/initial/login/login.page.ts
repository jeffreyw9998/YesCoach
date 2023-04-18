import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {GoogleService} from "../../services/gService/google.service";
import {Router} from "@angular/router";
import {ApiService} from "../../services/apiservice/api.service";
import firebase from "firebase/compat";
import UserInfo = firebase.UserInfo;
import {StorageService} from "../../services/storage/storage.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  constructor(private gAuth: GoogleService,
              private readonly router: Router,
              private readonly apiService: ApiService,
              private readonly storage: StorageService) {
  }

  ngOnInit() {
  }


  async signInWithGoogle() {
    await this.gAuth.signIn();

    this.apiService.getUserInfo(this.gAuth.user!.uid).subscribe({
      next: (data) => {
        // Redirect to home otherwise
        this.storage.set('userInfo', JSON.stringify(data)).then(() => {});
        this.router.navigate(['/']).then(() => {});
      } ,
      error: (error) => {
        // Redirect to register page if user is not registered in database
        this.router.navigate(['/register']).then(() => {});
      }
    })

  }


  async refresh() {
    await this.gAuth.refresh();
  }


  async signOut() {
    await this.gAuth.signOut();
  }
}
