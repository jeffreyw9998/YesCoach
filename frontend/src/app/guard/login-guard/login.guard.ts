import {inject, Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import {UserService} from "../../services/gService/user.service";

@Injectable({
  providedIn: 'root'
})
class LoginGuard {

  constructor(private gAuth: UserService, private router: Router) {
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
