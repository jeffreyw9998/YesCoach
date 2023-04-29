import {Injectable, NgZone} from '@angular/core';
import {Platform} from "@ionic/angular";
import {StorageService} from "../storage/storage.service";
import {AuthCredential, FirebaseAuthentication, User} from "@capacitor-firebase/authentication";
import {initializeApp} from "firebase/app";
import {environment} from "../../../environments/environment";
import { UserInfo } from 'app/types/userInfo';
import {BehaviorSubject} from "rxjs";

interface GoogleUser extends User {
  authentication: AuthCredential;
}


@Injectable({
  providedIn: 'root',
})
export class UserService {

  user: GoogleUser | null = null;
  isLoggedIn = false;
  private dbUserInfo: UserInfo | null = null;
  private nextPullDate: Date | null = null;
  userSubject = new BehaviorSubject<User | null>(null);
  constructor(private storage: StorageService, private readonly platform: Platform,
              private readonly ngZone: NgZone) {
    FirebaseAuthentication.removeAllListeners().then(() => {
      FirebaseAuthentication.addListener('authStateChange', (change) => {
        this.ngZone.run(() => {
          this.userSubject.next(change.user);
        });
      });
    });
    // Only needed to support dev livereload.
    FirebaseAuthentication.getCurrentUser().then((result) => {
      this.userSubject.next(result.user);
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

    if (this.userInfo === null) {
      const userInfo = await this.storage.get('userInfo');
      if (typeof userInfo === "string") {
        this.dbUserInfo = JSON.parse(userInfo) as UserInfo;
        const nextPullDate = await this.storage.get('nextPullDate');
        if (nextPullDate !== null) {
          this.nextPullDate = new Date(nextPullDate);
        }
      }
    }

  }

  get userInfo(): UserInfo{
    // Clone userInfo object
    return JSON.parse(JSON.stringify(this.dbUserInfo));
  }

  set userInfo(userInfo: UserInfo) {
    this.storage.set('userInfo', JSON.stringify(userInfo)).then(() => {})
    this.dbUserInfo = userInfo;
  }

  get nextPullDataDate(): Date | null{
    return this.nextPullDate;
  }

  set nextPullDataDate(date: Date | null) {
    if (date === null) {
      this.storage.remove('nextPullDate').then(() => {});
    } else {
      this.storage.set('nextPullDate', date.toISOString()).then(() => {});
    }
    this.nextPullDate = date;
  }

  async signIn() {

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
          'https://www.googleapis.com/auth/calendar.freebusy',
          'https://www.googleapis.com/auth/fitness.location.read'
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
  }




  async signOut() {
    await FirebaseAuthentication.signOut();
    await this.storage.removeEverything();
    this.user = null;
    this.isLoggedIn = false;
    this.nextPullDataDate = null;
  }

}
