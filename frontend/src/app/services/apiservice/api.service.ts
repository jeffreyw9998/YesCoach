import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {concatMap, map, Observable, of} from "rxjs";
import {environment} from "../../../environments/environment";
import {UserInfo, UserInfoForm} from "../../types/userInfo";
import {Message} from "../../types/message";
import {Option} from "../../types/option";

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

  pullUserData(user_id: string, option: Option) {
    return this.http.post<Message>(environment.apiUrl + '/activity/' + user_id,
      JSON.stringify(option),
      {
        headers: this.headers
      });
  }

  registerAndPullData(userInfo: UserInfoForm, option: Option): Observable<UserInfo> {
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


  getStatsAndPullData(user_id: string, option: Option): Observable<any> {
    return of(1);
  }
}
