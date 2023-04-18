import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {GoogleService} from "../../services/gService/google.service";
import {Router} from "@angular/router";
import {ApiService} from "../../services/apiservice/api.service";
import {UserInfo, UserInfoForm} from "../../types/userInfo";
import {StorageService} from "../../services/storage/storage.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage implements OnInit {


  get _18YearsAgo() {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return new Date(`${year}-${month}-${day}`).toISOString();
  }


  public userInfo: UserInfoForm = {
    id: this.gAuth.user!.uid,
    name: this.gAuth.user!.displayName as string,
    email: this.gAuth.user!.email as string,
    height: 20,
    weight: 7,
    birthday: '',
    password: 'Somerandompassword'
  }

  constructor(private gAuth: GoogleService,
              private apiService: ApiService,
              private router: Router,
              private alertController: AlertController,
              private storage: StorageService){
  }

  ngOnInit() {
    this.userInfo.birthday = this._18YearsAgo;
  }


  register() {
    this.apiService.register(this.userInfo).subscribe({
      next: (data: UserInfo) => {
        this.storage.set('userInfo', JSON.stringify(data)).then(() => {})
        this.router.navigate(['/']).then(() => {})
      },
      error: (err) => {
        this.presentAlert().then(() => {});
      }
  })}

  get photoUrl() {
    if (this.gAuth.user === null) {
      return null
    }
    return this.gAuth.user.photoUrl;
  }


  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'User is registered in database',
      subHeader: 'Subtitle',
      message: 'Sorry, you have been registered in the database. Please login again.',
      buttons: ['OK']
    });

    await alert.present();
    this.router.navigate(['/login']).then(r => {
      console.log(r);
    })

  }
}
