import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {UserInfo} from "../../types/userInfo";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GoalsPage implements OnInit {

  goals = ['muscles'];
  goals_quantity = [0, 0, 0];
  name = '';
  dbUser!: UserInfo;
  constructor(private readonly uService: UserService, private readonly apiService: ApiService,
              private readonly router: Router, private alertController: AlertController) {
  }

  ngOnInit() {
    this.name = this.uService.user!.displayName as string;
    this.dbUser = this.uService.userInfo;
    this.goals_quantity = this.dbUser.goals_quantity!;
  }

  setGoals(){

    if (this.goals.indexOf('sleep') === -1 || this.goals.indexOf('hydration') === -1){
      this.goals = this.goals.concat(['sleep', 'hydration']);
    }
    // Clone the array
    this.dbUser.goals =  [...this.goals];
    this.dbUser.goals_quantity = this.goals_quantity;
    this.apiService.updateUser(this.dbUser).subscribe({
      next: (newUser: UserInfo) => {
        this.uService.userInfo = newUser;
        this.presentAlert('Goals updated!').then(() => {});
      },
      error: (err) => {
        console.log(err);
        this.presentAlert(err).then(() => {});
      }
    });
    // Remove sleep and hydration from goals
    this.goals.pop();
    this.goals.pop();
  }

  async presentAlert(err: HttpErrorResponse | string) {
    let message: string;
    let header = 'Oh no';
    if (typeof err === 'string'){
      message = err;
      header = 'Awesome';
    }
    else{
      message = err.error.detail || err.statusText;
    }
    const alert = await this.alertController.create({
      header: `${header}`,
      message: `${message}. You will be redirected to the home page`,
      buttons: ['OK']
    });
    await alert.present();
    await this.router.navigate(['/home'])
  }

}
