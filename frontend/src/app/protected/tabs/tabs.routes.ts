import {Routes} from '@angular/router';
import {TabsPage} from './tabs.page';
import {canActivateHome} from "../../guard/auth-guard/auth-guard.guard";

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        canActivate: [canActivateHome],
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'activities',
        canActivate: [canActivateHome],
        loadComponent: () =>
          import('../activities/activities.page').then((m) => m.ActivitiesPage),
      },
      {
        path: 'sleep',
        canActivate: [canActivateHome],
        loadComponent: () =>
          import('../sleep/sleep.page').then((m) => m.SleepPage),
      },
      {
        path: 'hydration',
        canActivate: [canActivateHome],
        loadComponent: () => import('../nutrition/hydration.component').then(m => m.Hydration)
      },
      {
        path: 'profile',
        canActivate: [canActivateHome],
        loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
      },
    ],
  },
];
