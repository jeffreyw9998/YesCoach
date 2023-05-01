import {Component, OnInit} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {GFitOptions, StatOptions} from "../../types/option";
import {get7DaysAgoDate, getTimeFromDate} from "../../services/util/util";
import {Slumber, Stats} from "../../types/Stats";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-sleep',
  templateUrl: 'sleep.page.html',
  styleUrls: ['sleep.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule],
})




export class SleepPage implements  OnInit{
  userInfo = this.uService.userInfo;
  postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
  }
  // Date object 1 day ago
  curDate = new Date();
  // Get sleep data from a week ago
  startDate = get7DaysAgoDate(this.curDate);

  getOption: StatOptions = {
    end_time: this.curDate.toISOString(),
    start_time: this.startDate.toISOString(),
    which_tables: ['sleep'],
    aggregate_types: [''],
    summarize: false
  }

  slumbers : Slumber[]= [
    {
      date: "2020-11-01",
      start: "2020-11-01 23:00",
      end: "2020-11-02 07:00",
    },
    {
      date: "2020-11-01",
      start: "2020-11-01 23:00",
      end: "2020-11-02 07:00",
    },
    {
      date: "2020-11-01",
      start: "2020-11-01 23:00",
      end: "2020-11-02 07:00",
    }
  ]


  ngOnInit() {
    this._getBasicStats();
  }

  constructor(private uService: UserService, private apiService: ApiService) {}
  handleRefresh(event: any) {
    setTimeout(() => {
      this._getBasicStats();
      event.target.complete();
    }, 50);
  };

  parseSleepStats(stats: Stats){
    const pastSleep = stats.sleep;
    const slumbers: Slumber[] = [];

    for (let sleep of pastSleep){

      // The startTime is a datetime string in ISO format. The timezone is UTC
      // but there is no timezone info in the string. So we need to convert it
      // to the local timezone.

      const timestamp = Date.parse(sleep.startTime + "Z");
      const date = new Date(timestamp);
      const start = getTimeFromDate(date);
      const end = getTimeFromDate(new Date(Date.parse(sleep.endTime + "Z")));
      slumbers.push({
        // Format date into YYYY-MM-DD
        date: date.toLocaleDateString(),
        start: start,
        end: end,
      })
    }
    return slumbers;
  }

  private _getBasicStats(){
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()){
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getFullYear(), this.curDate.getMonth(), this.curDate.getDate() + 1);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.getOption).subscribe(([stats, newUser]) => {
        if (stats.sleep.length > 0){
            this.slumbers = this.parseSleepStats(stats);
        }
        this.uService.userInfo = newUser;
      })
    }
    else{
      this.apiService.getStats(this.userInfo.id, this.getOption).subscribe((stats) => {
        if (stats.sleep.length > 0){
            this.slumbers = this.parseSleepStats(stats);
        }
      });
    }
  }


}
