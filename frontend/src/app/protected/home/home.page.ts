import {Component, OnInit} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ExploreContainerComponent} from '../explore-container/explore-container.component';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {GFitOptions, StatOptions} from "../../types/option";
import {get24HoursAgoDate} from "../../services/util/util";
import {BasicStats, Stats} from "../../types/Stats";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class HomePage implements OnInit {


  basicStats : BasicStats = {
    steps: "0",
    distance: "0",
    sleepHours: "0",
    burnedCalories: "0",
  }

  userInfo = this.uService.userInfo;
  postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
  }
  // Date object 24 hours ago
  curDate = new Date();

  startDate = get24HoursAgoDate(this.curDate);


  getOption: StatOptions = {
    end_time: this.curDate.toISOString(),
    start_time: this.startDate.toISOString(),
    which_tables: ['aggregate', 'sleep'],
    aggregate_types: ['steps', 'calories', 'distance'],
    summarize: true,
  }

  ngOnInit(): void {
    this._getBasicStats();
  }

  parseBasicStats(stats: Stats): BasicStats{

    const sleepSession = stats.sleep[stats.sleep.length - 1];
    const sleepStart = new Date(sleepSession.startTime)
    const sleepEnd = new Date(sleepSession.endTime)
    const sleepHours = ((sleepEnd.getTime() - sleepStart.getTime()) / 1000 / 60 /60).toFixed(2)

    const burnedCalories = (stats.aggregate[0] || {sum: 0}).sum;
    const distance = (stats.aggregate[1] || {sum: 0}).sum;
    const steps = (stats.aggregate[2] || {sum: 0}).sum;

    return {
      burnedCalories : burnedCalories.toFixed(2),
      distance : distance.toFixed(2),
      steps : steps.toFixed(2),
      sleepHours : sleepHours
    }
  }

  private _getBasicStats() {
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()) {
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getTime() + 24 * 60 * 60 * 1000);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.getOption).subscribe(([stats, newUser]) => {
        if (stats.aggregate.length > 0 && stats.sleep.length > 0){
          this.basicStats = this.parseBasicStats(stats);
        }
        this.uService.userInfo = newUser;
      })
    } else {
      this.apiService.getStats(this.userInfo.id, this.getOption).subscribe((stats) => {
        if (stats.aggregate.length > 0 && stats.sleep.length > 0){
          this.basicStats = this.parseBasicStats(stats);
        }
      });
    }
  }

  constructor(private uService: UserService, private apiService: ApiService) {
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      this._getBasicStats();
      event.target.complete();
    }, 50);
  };

}
