import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {UserService} from "../../services/gService/user.service";

@Injectable({
  providedIn: 'root'
})
 class AuthGuard {


  constructor(private uService: UserService, private  router: Router) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.uService.isLoggedIn && this.uService.userInfo === null){
      return this.router.parseUrl("/login")
    }
    else{
      return true
    }

  }

}

export const canActiveProtected: CanActivateFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(AuthGuard).canActivate(route,state);
  };
