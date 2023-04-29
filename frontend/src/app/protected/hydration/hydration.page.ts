import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ExploreContainerComponent} from "../explore-container/explore-container.component";
import {GFitOptions, StatOptions} from "../../types/option";
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {get24HoursAgoDate} from "../../services/util/util";

@Component({
  selector: 'app-hydration',
  templateUrl: './hydration.page.html',
  styleUrls: ['./hydration.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent]
})
export class Hydration implements OnInit {

  // @ts-ignore
  userInfo = this.uService.userInfo;
  postOption: GFitOptions = {
    access_token: this.uService.user!.authentication.accessToken!,
  }
  // Date object 1 day ago
  curDate = new Date();

  startDate = get24HoursAgoDate(this.curDate);

  getOption: StatOptions = {
    end_time: this.curDate.toISOString(),
    start_time: this.startDate.toISOString(),
    which_tables: ['fitness'],
    aggregate_types: [''],
    summarize: false
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      this._getBasicStats();
      event.target.complete();
    }, 50);
  };

  ngOnInit() {}

  constructor(private uService: UserService, private apiService: ApiService) {}

  private _getBasicStats(){
    const nextPullDate = this.uService.nextPullDataDate;
    if (nextPullDate === null || nextPullDate.getTime() < Date.now()){
      // Next pull date is next day
      this.uService.nextPullDataDate = new Date(this.curDate.getFullYear(), this.curDate.getMonth(), this.curDate.getDate() + 1);
      this.apiService.pullDataAndGetData(this.userInfo, this.postOption, this.getOption).subscribe(([stats, newUser]) => {
        console.log(stats);
        this.uService.userInfo = newUser;
      })
    }
    else{
      this.apiService.getStats(this.userInfo.id, this.getOption).subscribe((stats) => {
        console.log(stats);
      });
    }
  }


}
