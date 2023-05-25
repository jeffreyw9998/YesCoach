import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlertController, IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {UserInfo} from "../../types/userInfo";
import {Preferences} from "../../types/preferences";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
  selector: 'app-goals',
  templateUrl: './muscles.page.html',
  styleUrls: ['./muscles.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Muscles {
  currentMuscles: string[] | undefined = undefined
  private preferences: Preferences = {
    preferenceArray: [],
    type: 'muscles',
    time: '0000:00:00T00:00:00.000Z'
  }
  private userInfo: UserInfo = this.uService.userInfo;

  constructor(private apiService: ApiService, private uService: UserService, private router: Router,
              private alertController: AlertController) {
  }

  handleChange(ev: any) {
    this.preferences.preferenceArray = ev.target.value;
  }

  save() {
    {/* api call here*/
    }
    this.preferences.time = new Date().toISOString();
    this.apiService.postPreferences(this.userInfo.id, this.preferences).subscribe({
      next: (data) => {
        if (data.detail.startsWith('Successfully')) {
          this.apiService.callRecommendation.next(true);
          this.router.navigate(['/activities'], {queryParams: {saved: true}})
        }
      },

      error: (err) => {
        console.log(err)
        this.presentAlert(err).then(() => {
        });
      }
    })

  }

  async presentAlert(err: HttpErrorResponse) {
    const alert = await this.alertController.create({
      header: 'Oh no',
      message: `${err.error.detail || err.statusText}. You will be redirected to the home page`,
      buttons: ['OK']
    });
    await alert.present();
    await this.router.navigate(['/home'])
  }


  emptyArray() {
    return this.preferences.preferenceArray?.length === 0;
  }
}
