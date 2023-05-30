import {Component, OnInit} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {GFitOptions, StatOptions} from "../../types/option";
import {get24HoursAgoDate} from "../../services/util/util";
import {BasicStats, Stats} from "../../types/Stats";
import {Recommendation} from "../../types/recommendation";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HomePage implements OnInit {


  basicStats: BasicStats = {
    steps: "0",
    distance: "0",
    sleepHours: "0",
    burnedCalories: "0",
  }
  lifestyleScore = {
    score: 87,
    comment: "You are doing great!"
  }
  private userInfo = this.uService.userInfo;
  private postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
    pullSleepFitness: true,
    pullHydration: true,
    pullCalories: true,
    pullDistance: true,
    pullSteps: true
  }
  // Date object 24 hours ago
  private curDate = new Date();
  private startDate = get24HoursAgoDate(this.curDate);
  private getOption: StatOptions = {
    end_time: this.curDate.toISOString(),
    start_time: this.startDate.toISOString(),
    which_tables: ['aggregate', 'sleep'],
    aggregate_types: ['steps', 'calories', 'distance'],
    summarize: true,
  }

  constructor(private uService: UserService, private apiService: ApiService) {
  }

  get recOption() {

    const curDate = new Date();

    const startDate = get24HoursAgoDate(this.curDate);
    this.getOption.end_time = curDate.toISOString();
    this.getOption.start_time = startDate.toISOString();
    return this.getOption;
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      this._getBasicStats();
      this._getRecommendation();
      event.target.complete();
    }, 50);
  };

  ngOnInit(): void {
    this._getBasicStats();
    this._getRecommendation();
  }

  parseBasicStats(stats: Stats): BasicStats {

    const sleepSession = stats.sleep[stats.sleep.length - 1];
    const sleepStart = new Date(sleepSession.startTime)
    const sleepEnd = new Date(sleepSession.endTime)
    const sleepHours = ((sleepEnd.getTime() - sleepStart.getTime()) / 1000 / 60 / 60).toFixed(2)

    const burnedCalories = (stats.aggregate[0] || {sum: 0}).sum;
    const distance = (stats.aggregate[1] || {sum: 0}).sum / 1000 / 1.609;
    const steps = (stats.aggregate[2] || {sum: 0}).sum;

    return {
      burnedCalories: burnedCalories.toFixed(2),
      distance: distance.toFixed(2),
      steps: steps.toFixed(2),
      sleepHours: sleepHours
    }
  }

  private _getRecommendation() {
    this.apiService.getRecommendation(this.userInfo.id, ['fitness', 'sleep', 'hydration'], true).subscribe((rec: Recommendation) => {
      this.lifestyleScore.score = (rec.sleep?.score || 0) + (rec.fitness?.score || 0) + (rec.hydration?.score || 0);
      this.lifestyleScore.score = Math.round(this.lifestyleScore.score);
      this.lifestyleScore.comment = rec.comment || "You are doing great!";
    });
  }

  private _getBasicStats() {
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()) {
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getTime() + 86400000);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.recOption).subscribe(([stats, newUser]) => {
        if (stats.aggregate.length > 0 && stats.sleep.length > 0) {
          this.basicStats = this.parseBasicStats(stats);
        }
        this.uService.userInfo = newUser;
      })
    } else {
      this.apiService.getStats(this.userInfo.id, this.recOption).subscribe((stats) => {
        if (stats.aggregate.length > 0 && stats.sleep.length > 0) {
          this.basicStats = this.parseBasicStats(stats);
        }
      });
    }
  }


}
