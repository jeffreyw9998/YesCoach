import {Injectable} from '@angular/core';
import {isPlatform} from "@ionic/angular";
import {StorageService} from "./storage.service";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class GoogleService {

  userSubject = new Subject<any>();
  user = null;
  baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';

  headers = new HttpHeaders().set('Content-Type', 'application/json;encoding=utf-8');
  constructor(private storage: StorageService, private http: HttpClient) {
    // Initialize GoogleAuth plugin if not on Capacitor because
    // Capacitor will initialize it automatically

    if (this.user === null) {
      this.storage.get('user').then((user) => {
        if (typeof user === "string") {
          // this.user = JSON.parse(user) as User;
          // Set headers;
          // this.headers = this.headers.set('Authorization', `Bearer ${this.user.authentication.accessToken}`);
        }
      });
    }

  }


  async signIn() {
    // this.user =

    // Save user in storage
    await this.storage.set('user', JSON.stringify(this.user));


  }


  async signOut() {

  }

  async refresh() {
  }


  getActivities(fromDate: string, toDate: string): Observable<any>{
    const queryParams =  new HttpParams().set('startTime', fromDate).set('endTime', toDate);
    return this.http.get(`${this.baseUrl}/sessions`, {
        params: queryParams,
      headers: this.headers
    });

  }


}
