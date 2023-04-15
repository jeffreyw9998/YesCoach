import {inject, Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import {GoogleService} from "../../services/gService/google.service";

@Injectable({
  providedIn: 'root'
})
class LoginGuard {

  constructor(private gAuth: GoogleService, private router: Router) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.gAuth.isLoggedIn){
      return this.router.parseUrl("/home")
    }
    else{
      return true
    }

  }

}

export const canActivateLogin: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(LoginGuard).canActivate(route, state);
}
