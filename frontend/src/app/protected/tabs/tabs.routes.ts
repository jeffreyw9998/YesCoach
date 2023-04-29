import {Routes} from '@angular/router';
import {TabsPage} from './tabs.page';
import {canActiveProtected} from "../../guard/auth-guard/auth-guard.guard";

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        canActivate: [canActiveProtected],
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'activities',
        canActivate: [canActiveProtected],
        loadComponent: () =>
          import('../activities/activities.page').then((m) => m.ActivitiesPage),
      },
      {
        path: 'sleep',
        canActivate: [canActiveProtected],
        loadComponent: () =>
          import('../sleep/sleep.page').then((m) => m.SleepPage),
      },
      {
        path: 'hydration',
        canActivate: [canActiveProtected],
        loadComponent: () => import('../hydration/hydration.page').then(m => m.Hydration)
      },
      {
        path: 'profile',
        canActivate: [canActiveProtected],
        loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'goals',
        canActivate: [canActiveProtected],
        loadComponent: () => import('../goals/goals.page').then( m => m.GoalsPage)
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
      },
    ],
  },
];
