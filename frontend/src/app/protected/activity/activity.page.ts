import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlertController, IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {UserInfo} from "../../types/userInfo";
import {HttpErrorResponse} from "@angular/common/http";
import {Preferences} from "../../types/preferences";
import {Router} from "@angular/router";
import {type ActivityMap, integerActivitiesMap} from "../../integerActivitiesMap";

@Component({
  selector: 'app-goals',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Activity implements OnInit {
  allActivities: string[] = [];
  blackList = new Set<string>(['Unknown (unable to detect activity)', 'Tilting (sudden device gravity change)',
    'In vehicle', 'Housework', 'Still (not moving)', 'Walking (fitness)', 'Walking (stroller)', 'Walking (treadmill)'])
  private userInfo: UserInfo = this.uService.userInfo;
  private preferences: Preferences = {
    preferenceArray: [],
    type: 'weight',
    time: '0000:00:00T00:00:00.000Z'
  };
  private activityMap = integerActivitiesMap;

  constructor(private apiService: ApiService, private uService: UserService, private alertController: AlertController,
              private router: Router) {
  }

  ngOnInit(): void {
    this.allActivities = this._getAllActivitiess(this.activityMap);
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

    });
  }

  emptyArray(): boolean {
    return this.preferences.preferenceArray?.length === 0;
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

  private _getAllActivitiess(activityMap: ActivityMap) {
    return Object.keys(activityMap).filter((key) => {
      // Return all keys that are not integers
      return !Number.isInteger(parseInt(key)) && !this.blackList.has(key);
    })
  }

}
