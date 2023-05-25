import {Component, OnDestroy, OnInit} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {GFitOptions, StatOptions} from "../../types/option";
import {formatTime, get24HoursAgoDate} from "../../services/util/util";
import {integerActivitiesMap} from "../../integerActivitiesMap";
import {Stats, SummarizedActivity} from "../../types/Stats";
import {CommonModule} from "@angular/common";
import {RouterModule} from '@angular/router';
import {Exercise, Recommendation} from "../../types/recommendation";
import {Subscription} from "rxjs";
import {ListItemComponent} from "../../list-item/list-item.component";

@Component({
  selector: 'app-activities',
  templateUrl: 'activities.page.html',
  styleUrls: ['activities.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ListItemComponent]
})
export class ActivitiesPage implements OnInit, OnDestroy {

  goalIsGainMuscle = false /* api call to see if user's goal is gain muscle or lose weight (set booleans accordingly)*/
  goalIsLoseWeight = true

  userInfo = this.uService.userInfo;
  postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
    pullSleepFitness: true,
    pullHydration: true,
    pullCalories: true,
    pullDistance: true,
    pullSteps: true
  }
  activityMap = integerActivitiesMap;
  curDate = new Date();
  // Date object 1 day ago
  startDate = new Date(this.curDate.getTime() - 24 * 60 * 60 * 1000)
  activities: SummarizedActivity[] = [];
  comment: string = "";
  exerciseList: Exercise[] = []
  getOption: StatOptions = {
    end_time: this.curDate.toISOString(),
    start_time: this.startDate.toISOString(),
    which_tables: ['fitness'],
    aggregate_types: [''],
    summarize: false
  }
  private datetimeFormatter = Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  private _uSubjectSubscription!: Subscription;
  private _callRecommendationSubscription!: Subscription;

  constructor(private uService: UserService, private apiService: ApiService) {
  }

  get recOption() {

    const curDate = new Date();

    const startDate = get24HoursAgoDate(this.curDate);
    this.getOption.end_time = curDate.toISOString();
    this.getOption.start_time = startDate.toISOString();
    return this.getOption;
  }

  ngOnInit() {
    this._uSubjectSubscription = this.uService.userSubject.subscribe((user) => {
      if (user !== null) {
        this.userInfo = user;
      }
      this._initialize();
    })
    this._getBasicStats();
    // Check for query params 'saved' in the url. If it is true, then call recommendation api
    this._callRecommendationSubscription = this.apiService.callRecommendation.subscribe((saved) => {
      if (saved) {
        this._getRecommendation();
      }
    })
    this.apiService.callRecommendation.next(true);
  }

  ngOnDestroy() {
    this._uSubjectSubscription.unsubscribe();
    this._callRecommendationSubscription.unsubscribe();
    this.exerciseList = [];
    this.comment = "";
    this.activities = [];
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      this._initialize();
      this._getBasicStats();
      this._getRecommendation();
      event.target.complete();
    }, 50);
  };

  parseActivitiesStats(stats: Stats) {
    let activities: SummarizedActivity[] = [];
    for (let activity of stats.fitness) {
      let activityName = this.activityMap[activity.activityType] as string;
      let startTime = new Date(Date.parse(activity.startTime + "Z"));
      let endTime = new Date(Date.parse(activity.endTime + "Z"));
      let duration = (endTime.getTime() - startTime.getTime()) / 1000;
      let durationString = formatTime(duration);
      activities.push({
        name: activityName,
        // Format date to YYYY-MM-DD HH:MM:SS
        date: this.datetimeFormatter.format(startTime),
        duration: durationString,
      });
    }
    return activities;
  }

  private _initialize() {
    if (this.userInfo.goals![0] == 'muscles') {
      this.goalIsGainMuscle = true;
      this.goalIsLoseWeight = false;
      this.comment = "Do some weight training";
    } else if (this.userInfo.goals![0] == 'weight') {
      this.goalIsGainMuscle = false;
      this.goalIsLoseWeight = true;
      this.comment = "Do some cardio";
    } else {
      this.goalIsGainMuscle = false;
      this.goalIsLoseWeight = false;
      this.comment = "You have no goals set";
    }

  }

  private _parseRecommendation(rec: Recommendation) {
    if (rec.fitness !== undefined) {
      this.comment = rec.fitness.comment;
      this.exerciseList = rec.fitness.exercise_list;
    }
  }

  private _getRecommendation() {
    this.apiService.getRecommendation(this.userInfo.id, ['fitness']).subscribe((rec) => {
      this._parseRecommendation(rec);
    })
  }

  private _getBasicStats() {
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()) {
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getTime() + 86400000);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.recOption).subscribe(([stats, newUser]) => {
        if (stats.fitness.length > 0) {
          this.activities = this.parseActivitiesStats(stats);
        }

        this.uService.userInfo = newUser;
      })
    } else {
      this.apiService.getStats(this.userInfo.id, this.recOption).subscribe((stats) => {
        if (stats.fitness.length > 0) {
          this.activities = this.parseActivitiesStats(stats);
        }
      });
    }
  }


}
