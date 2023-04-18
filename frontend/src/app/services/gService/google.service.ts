import {Injectable, NgZone} from '@angular/core';
import {Platform} from "@ionic/angular";
import {StorageService} from "../storage/storage.service";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AuthCredential, FirebaseAuthentication, User} from "@capacitor-firebase/authentication";
import {initializeApp} from "firebase/app";
import {environment} from "../../../environments/environment";

interface GoogleUser extends User {
  authentication: AuthCredential;
}


@Injectable({
  providedIn: 'root',
})
export class GoogleService {

  user: GoogleUser | null = null;
  baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';
  headers = new HttpHeaders().set('Content-Type', 'application/json;encoding=utf-8')
  isLoggedIn = false;
  constructor(private storage: StorageService, private http: HttpClient, private readonly platform: Platform,
              private readonly ngZone: NgZone) {
    FirebaseAuthentication.removeAllListeners().then(() => {
      FirebaseAuthentication.addListener('authStateChange', (change) => {
        this.ngZone.run(() => {
          // this.userSubject.next(change.user);
        });
      });
    });
    // Only needed to support dev livereload.
    FirebaseAuthentication.getCurrentUser().then((result) => {
      // this.userSubject.next(result.user);
    });
  }

  public async initialize(): Promise<void> {
    if (this.platform.is('capacitor')) {
      return;
    }
    /**
     * Only needed if the Firebase JavaScript SDK is used.
     *
     * Read more: https://github.com/robingenz/capacitor-firebase/blob/main/packages/authentication/docs/firebase-js-sdk.md
     */
    initializeApp(environment.firebase);

    if (this.user === null) {
      const user = await this.storage.get('user');
      if (typeof user === "string") {
        this.user = JSON.parse(user);
        this.isLoggedIn = true;
      }
    }
  }

  async signIn() {
    // this.user =

    // Save user in storage
    const result = await FirebaseAuthentication.signInWithGoogle(
      {
        mode: 'popup', scopes: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.body.read',
          'https://www.googleapis.com/auth/fitness.heart_rate.read',
          'https://www.googleapis.com/auth/fitness.body_temperature.read',
          'https://www.googleapis.com/auth/fitness.nutrition.read',
          'https://www.googleapis.com/auth/fitness.sleep.read',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/calendar.events.readonly',
          'https://www.googleapis.com/auth/calendar.settings.readonly',
          'https://www.googleapis.com/auth/calendar.freebusy'
        ], customParameters: [{
          key: 'returnSecureToken',
          value: 'true'
        }]
      }
    );
    this.user = result.user as GoogleUser;
    this.user.authentication = result.credential as AuthCredential;

    await this.storage.set('user', JSON.stringify(this.user));
    this.isLoggedIn = true;

    // If the authorization header is not set, set the authorization header.
  }


  async signOut() {
    await FirebaseAuthentication.signOut();
    await this.storage.removeEverything();
    this.user = null;
    this.isLoggedIn = false;
  }

  async refresh() {
  }


  getActivities(fromDate: string, toDate: string): Observable<any> {
    const queryParams = new HttpParams().set('startTime', fromDate).set('endTime', toDate);
    return this.http.get(`${this.baseUrl}/sessions`, {
      params: queryParams,
      headers: this.headers.set('Authorization', `Bearer ${this.user?.authentication.accessToken}`)
    });

  }


}
