import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
  }


  // Get user info from database with the uid from Google
  getUserInfo(uid: string) {
    return {
      exist: false
    }
  }


  userExists(uid: string) {
    return this.getUserInfo(uid).exist;
  }

  register(userInfo: any): Observable<any> {

    return of({
      message: 'User is registered',
      id: '1'
    });
  }
}
