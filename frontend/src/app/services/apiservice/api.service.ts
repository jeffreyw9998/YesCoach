import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {StorageService} from "../storage/storage.service";
import {environment} from "../../../environments/environment";
import {UserInfo} from "../../types/userInfo";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private storage: StorageService) {
  }


  // Get user info from database with the uid from Google
  getUserInfo(uid: string): Observable<UserInfo> {
    return this.http.get<UserInfo>(environment.apiUrl + '/users/' + uid, {
      headers: new HttpHeaders().set('accept', 'application/json')
    });
  }


  userExists(uid: string): Observable<boolean> {
    return this.getUserInfo(uid).pipe(
      map((userInfo) => {
        return true;
      }),
      catchError(() => {
        return of(false);
      })
    )
  }

  register(userInfo: any, user_id: string): Observable<UserInfo | { message: string }> {
    this.storage.set('userInfo', JSON.stringify(userInfo)).then(() => {
    });

    userInfo.id = user_id;
    userInfo.password = 'somerandompassword';
    console.log(userInfo)
    return this.http.post<UserInfo>(environment.apiUrl + '/users', JSON.stringify(userInfo),
      {headers: new HttpHeaders().set('accept', 'application/json').set('Content-Type', 'application/json')}).pipe(
      catchError((err) => {
        return of({message: err.detail})
      })
    );
  }
}
