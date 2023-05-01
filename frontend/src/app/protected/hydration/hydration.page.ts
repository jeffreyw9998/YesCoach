import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ExploreContainerComponent} from "../explore-container/explore-container.component";
import {GFitOptions, StatOptions} from "../../types/option";
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {convertLitersToOunces, get7DaysAgoDate} from "../../services/util/util";
import {Stats, Water} from "../../types/Stats";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-hydration',
  templateUrl: './hydration.page.html',
  styleUrls: ['./hydration.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule]
})
export class Hydration implements OnInit {

  userInfo = this.uService.userInfo;
  postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
  }
  // Date object 1 day ago
  curDate = new Date();

  startDate = get7DaysAgoDate(this.curDate);

  getOption: StatOptions = {
    end_time: this.curDate.toISOString(),
    start_time: this.startDate.toISOString(),
    which_tables: ['aggregate'],
    aggregate_types: ['hydration'],
    summarize: false
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      this._getBasicStats();
      event.target.complete();
    }, 50);
  };

  hydration_history: Water[] = [
    {
      date: "2020-11-01",
      amount: "64 ounces",
    },
    {
      date: "2020-11-01",
      amount: "64 ounces",
    },
    {
      date: "2020-11-01",
      amount: "64 ounces",
    }
  ]

  ngOnInit() {
    this._getBasicStats();
  }


  constructor(private uService: UserService, private apiService: ApiService) {}


  private _getWaterStats(stats: Stats){
    const water = stats.aggregate;
    const waterHistory: Water[] = [];

    for (let raw of water){
      const date = new Date(Date.parse(raw.startTime + "Z"));
      const amount = convertLitersToOunces(raw.quantity);
      waterHistory.push({
        date: date.toLocaleDateString(),
        amount: amount.toFixed(2) + " ounces"
      });
    }

    return waterHistory;

  }

  private _getBasicStats(){
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()){
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getFullYear(), this.curDate.getMonth(), this.curDate.getDate() + 1);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.getOption).subscribe(([stats, newUser]) => {
        if (stats.aggregate.length > 0){
          this.hydration_history = this._getWaterStats(stats);
        }
        this.uService.userInfo = newUser;
      })
    }
    else{
      this.apiService.getStats(this.userInfo.id, this.getOption).subscribe((stats) => {
        if (stats.aggregate.length > 0){
          this.hydration_history = this._getWaterStats(stats);
        }
      });
    }
  }


}
