import {Routes} from '@angular/router';
import {canActivateLogin} from "./guard/login-guard/login.guard";

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./protected/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    canActivate: [canActivateLogin],
    loadComponent: () => import('./initial/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./initial/register/register.page').then(m => m.RegisterPage)
  },

];
