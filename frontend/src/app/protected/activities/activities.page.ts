import {Component, OnInit} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {GFitOptions, StatOptions} from "../../types/option";
import {formatTime, get24HoursAgoDate} from "../../services/util/util";
import {integerActivitiesMap} from "../../integerActivitiesMap";
import {Stats, SummarizedActivity} from "../../types/Stats";
import {CommonModule} from "@angular/common";
@Component({
  selector: 'app-activities',
  templateUrl: 'activities.page.html',
  styleUrls: ['activities.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule]
})
export class ActivitiesPage implements OnInit{
  userInfo = this.uService.userInfo;
  postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
  }
  activityMap = integerActivitiesMap;
  // Date object 1 day ago
  curDate = new Date();

  startDate = get24HoursAgoDate(this.curDate);

  activities: SummarizedActivity[] = [
    {
      name: 'Running',
      date: '2021-03-01',
      duration: '1h 30m',
    },
    {
      name: 'Running',
      date: '2021-03-01',
      duration: '1h 30m',
    },
    {
      name: 'Running',
      date: '2021-03-01',
      duration: '1h 30m',
    }
  ];

  getOption: StatOptions = {
    end_time: this.curDate.toISOString(),
    start_time: this.startDate.toISOString(),
    which_tables: ['fitness'],
    aggregate_types: [''],
  }
  ngOnInit() {
    this._getBasicStats();
  }

  constructor(private uService: UserService, private apiService: ApiService) {}
  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      this._getBasicStats();
      event.target.complete();
    }, 50);
  };

  parseActivitiesStats(stats: Stats){
    let activities: SummarizedActivity[] = [];
    for (let activity of stats.fitness){
      let activityName = this.activityMap[activity.activityType] as string;
      let startTime = new Date(Date.parse(activity.startTime + "Z"));
      let endTime = new Date(Date.parse(activity.endTime + "Z"));
      let duration = (endTime.getTime() - startTime.getTime()) / 1000;
      let durationString = formatTime(duration);
      activities.push({
        name: activityName,
        date: startTime.toLocaleDateString(),
        duration: durationString,
      });
    }
    return activities;
  }


  private _getBasicStats(){
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()){
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getFullYear(), this.curDate.getMonth(), this.curDate.getDate() + 1);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.getOption).subscribe(([stats, newUser]) => {
        if (stats.fitness.length > 0){
          this.activities = this.parseActivitiesStats(stats);
        }

        this.uService.userInfo = newUser;
      })
    }
    else{
      this.apiService.getStats(this.userInfo.id, this.getOption).subscribe((stats) => {
        if (stats.fitness.length > 0){
          this.activities = this.parseActivitiesStats(stats);
        }
      });
    }
  }


}
