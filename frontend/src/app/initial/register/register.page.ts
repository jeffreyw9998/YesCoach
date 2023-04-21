import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
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
    id: this.uService.user!.uid,
    name: this.uService.user!.displayName as string,
    email: this.uService.user!.email as string,
    height: 20,
    weight: 7,
    birthday: '',
    password: 'Somerandompassword'
  }

  constructor(private uService: UserService,
              private apiService: ApiService,
              private router: Router,
              private alertController: AlertController){
  }

  ngOnInit() {
    this.userInfo.birthday = this._18YearsAgo;
  }


  register() {
    this.apiService.register(this.userInfo).subscribe({
      next: (data: UserInfo) => {
        this.uService.userInfo = data;
        this.router.navigate(['/']).then(() => {})
      },
      error: (err) => {
        this.presentAlert().then(() => {});
      }
  })}

  get photoUrl() {
    if (this.uService.user === null) {
      return '';
    }
    return this.uService.user.photoUrl;
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
