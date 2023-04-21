import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {Router} from "@angular/router";
import {ApiService} from "../../services/apiservice/api.service";
import firebase from "firebase/compat";
import {StorageService} from "../../services/storage/storage.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  constructor(private uService: UserService,
              private readonly router: Router,
              private readonly apiService: ApiService) {
  }
  ngOnInit() {
  }


  async signInWithGoogle() {
    await this.uService.signIn();

    this.apiService.getUserInfo(this.uService.user!.uid).subscribe({
      next: (data) => {
        // Redirect to home otherwise
        this.uService.userInfo = data;
        this.router.navigate(['/']).then(() => {});
      } ,
      error: (error) => {
        // Redirect to register page if user is not registered in database
        this.router.navigate(['/register']).then(() => {});
      }
    })

  }

}
