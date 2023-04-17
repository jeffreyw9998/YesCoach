import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {StorageService} from "../storage/storage.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private storage: StorageService) {
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

  register(userInfo: any, user_id: string): Observable<any> {
    this.storage.set('user', JSON.stringify(userInfo)).then(() => {});

    userInfo.user_id = user_id;
    return of({
      message: 'User is registered',
      id: '1'
    });
  }
}
