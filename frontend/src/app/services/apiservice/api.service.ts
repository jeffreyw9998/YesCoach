import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {concatMap, map, Observable, forkJoin} from "rxjs";
import {environment} from "../../../environments/environment";
import {UserInfo, UserInfoForm} from "../../types/userInfo";
import {Message} from "../../types/message";
import {GFitOptions, StatOptions} from "../../types/option";
import {Stats} from "../../types/Stats";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  headers: HttpHeaders = new HttpHeaders().set('accept', 'application/json').set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {
  }


  // Get user info from database with the uid from Google
  getUserInfo(uid: string): Observable<UserInfo> {
    return this.http.get<UserInfo>(environment.apiUrl + '/users/' + uid, {
      headers: new HttpHeaders().set('accept', 'application/json')
    });
  }


  updateUser(userData: UserInfo) {
    return this.http.put<UserInfo>(environment.apiUrl + '/users/' + userData.id, JSON.stringify(userData),
      {
        headers: this.headers
      });

  }

  pullUserData(user_id: string, option: GFitOptions) {
    return this.http.post<Message>(environment.apiUrl + '/activity/' + user_id,
      JSON.stringify(option),
      {
        headers: this.headers
      });
  }

  registerAndPullData(userInfo: UserInfoForm, option: GFitOptions): Observable<UserInfo> {
    return this.http.post<UserInfo>(environment.apiUrl + '/users', JSON.stringify(userInfo), {
      headers: this.headers
    }).pipe(
      concatMap((userInfo) => {
        return this.pullUserData(userInfo.id, option).pipe(
          map((message: Message) => {
            if (message.detail.startsWith("Successfully")) {
              return userInfo;
            } else {
              throw new Error(message.detail);
            }
          })
        );
      }),
      concatMap((userInfo) => {
        userInfo.last_update = new Date().toISOString();
        return this.updateUser(userInfo);
      })
    );
  }

  getStats(user_id: string, option: StatOptions): Observable<Stats> {

    let params = new HttpParams();
    params = params.set('start_time', option.start_time);
    params = params.set('end_time', option.end_time);
    // For which_tables and aggregate_types, we need to append each element to the params
    for (let table of option.which_tables) {
      params = params.append('which_tables', table);
    }
    for (let type of option.aggregate_types) {
      params = params.append('aggregate_types', type);
    }
    if (option.summarize !== undefined){
      params = params.append('summarize', option.summarize);
    }

    return this.http.get<Stats>(environment.apiUrl + '/activity/' + user_id,
      {
        headers: this.headers,
        params: params
      });
  }


  pullDataAndGetData(user: UserInfo, postOption: GFitOptions, getOption: StatOptions): Observable<[Stats, UserInfo]>{
      return this.pullUserData(user.id, postOption).pipe(
        map((message: Message) => {
          if (message.detail.startsWith("Successfully")) {
            return "Success";
          } else {
            return message.detail;
          }
        }),
        // Call getStats and updateUsers in parallel
        concatMap( (message: string) => {
          if (message != "Success") {
            throw new Error(message);
          }
          else{
            user.last_update = new Date().toISOString();
           return forkJoin([this.getStats(user.id, getOption), this.updateUser(user)])
          }
        })
      );
  }

}
