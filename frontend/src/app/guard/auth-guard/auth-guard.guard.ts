import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {GoogleService} from "../../services/gService/google.service";

@Injectable({
  providedIn: 'root'
})
 class AuthGuard {


  constructor(private gAuth: GoogleService, private  router: Router) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.gAuth.isLoggedIn){
      return this.router.parseUrl("/login")
    }
    else{
      return true
    }

  }

}

export const canActivateHome: CanActivateFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(AuthGuard).canActivate(route,state);
  };
