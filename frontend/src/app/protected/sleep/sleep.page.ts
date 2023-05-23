import {Component, OnDestroy, OnInit} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {GFitOptions, StatOptions} from "../../types/option";
import {get7DaysAgoDate, getTimeFromDate} from "../../services/util/util";
import {Slumber, Stats} from "../../types/Stats";
import {CommonModule} from "@angular/common";
import {Recommendation} from "../../types/recommendation";

@Component({
  selector: 'app-sleep',
  templateUrl: 'sleep.page.html',
  styleUrls: ['sleep.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})




export class SleepPage implements  OnInit, OnDestroy{
  private userInfo = this.uService.userInfo;
  private postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
    pullSleepFitness: true,
    pullHydration: true,
    pullCalories: true,
    pullDistance: true,
    pullSteps: true
  }
  // Date object 1 day ago
  private curDate = new Date();
  // Get sleep data from a week ago
  private startDate = get7DaysAgoDate(this.curDate);

  private getOption: StatOptions = {
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

  recommendation: Recommendation = {
    sleep: {
      comment: "You are doing great!",
      next_bed_time: "22:00",
      next_wake_time: "07:00",
    }
  }

  constructor(private uService: UserService, private apiService: ApiService) {}

  ngOnInit() {
    this._getBasicStats();
    this._getRecommendation();
  }

  ngOnDestroy() {
    this.slumbers = [];
    this.recommendation = {
      sleep: {
        comment: "",
        next_bed_time: "",
        next_wake_time: "",
      }
    }
    this.analysisComment = ["", "", ""];
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this._getBasicStats();
      this._getRecommendation();
      event.target.complete();
    }, 50);
  };


  analysisComment = this._parseComment(this.recommendation.sleep?.comment);

  _parseComment(comment: string | undefined): string[]{
    // Get the first sentence
    if (comment !== undefined){
      const sentences = comment.split(". ");
      if (sentences.length == 1) {
        return [comment, "", ""];
      }
      else{
        return [sentences[0] + ".", sentences[1] + ".", sentences.slice(2).join(". ")]
      }
    }
    else{
      return ["", "", ""];
    }
  }


  _parseSleepStats(stats: Stats){
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

  private _getRecommendation(){
    this.apiService.getRecommendation(this.userInfo.id, ['sleep']).subscribe((recommendation) => {
      this.recommendation = recommendation;
      this.analysisComment = this._parseComment(this.recommendation.sleep?.comment);
    })
  }


  private _getBasicStats(){
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()){
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getTime() + 86400000);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.getOption).subscribe(([stats, newUser]) => {
        if (stats.sleep.length > 0){
            this.slumbers = this._parseSleepStats(stats);
        }
        this.uService.userInfo = newUser;
      })
    }
    else{
      this.apiService.getStats(this.userInfo.id, this.getOption).subscribe((stats) => {
        if (stats.sleep.length > 0){
            this.slumbers = this._parseSleepStats(stats);
        }
      });
    }
  }


}
