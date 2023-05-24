import {Component, OnDestroy, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {GFitOptions, StatOptions} from "../../types/option";
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {convertLitersToOunces, get7DaysAgoDate} from "../../services/util/util";
import {Stats, Water} from "../../types/Stats";
import {CommonModule} from "@angular/common";
import {Recommendation} from "../../types/recommendation";

@Component({
  selector: 'app-hydration',
  templateUrl: './hydration.page.html',
  styleUrls: ['./hydration.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Hydration implements OnInit, OnDestroy {

  userInfo = this.uService.userInfo;
  postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
    pullSleepFitness: true,
    pullHydration: true,
    pullCalories: true,
    pullDistance: true,
    pullSteps: true
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

  recommendation: Recommendation = {
    hydration: {
      comment: "You are doing great!",
    }
  }

  analysisComment: string[] = this._parseComment(this.recommendation.hydration?.comment);
  constructor(private uService: UserService, private apiService: ApiService) {}
  ngOnInit() {
    this._getBasicStats();
    this._getRecommendation();
  }

  ngOnDestroy() {
    this.hydration_history = [];
    this.recommendation = {
      hydration: {
        comment: "You are doing great!",
      }
    }
    this.analysisComment = [];
  }

  get recOption(){

    const curDate = new Date();

    const startDate = get7DaysAgoDate(this.curDate);
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


  private _parseComment(comment: string | undefined): string[]{
    if (comment === undefined){
      return [];
    }
    return comment.split(". ");
  }



  private _getWaterStats(stats: Stats){
    const water = stats.aggregate;
    const waterHistory: Water[] = [];

    for (let raw of water){
      const date = new Date(Date.parse(raw.endTime + "Z"));
      const amount = convertLitersToOunces(raw.quantity);
      waterHistory.push({
        date: date.toLocaleDateString(),
        amount: amount.toFixed(2) + " ounces"
      });
    }

    return waterHistory;

  }

  private _getRecommendation(){
    this.apiService.getRecommendation(this.userInfo.id, ['hydration']).subscribe((recommendation) => {
      this.recommendation = recommendation;
      this.analysisComment = this._parseComment(this.recommendation.hydration?.comment);
    })
  }

  private _getBasicStats(){
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()){
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getTime() + 86400000);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.recOption).subscribe(([stats, newUser]) => {
        if (stats.aggregate.length > 0){
          this.hydration_history = this._getWaterStats(stats);
        }
        this.uService.userInfo = newUser;
      })
    }
    else{
      this.apiService.getStats(this.userInfo.id, this.recOption).subscribe((stats) => {
        if (stats.aggregate.length > 0){
          this.hydration_history = this._getWaterStats(stats);
        }
      });
    }
  }


}
