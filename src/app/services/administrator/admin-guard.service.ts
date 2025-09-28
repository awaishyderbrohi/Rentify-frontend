import { Injectable } from '@angular/core';
import {  CanActivate,  Router, UrlTree  } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/User.model';
import { httpResource } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivate {
  BASE_URL = `${environment.apiUrl}`;

  constructor(private authService: AuthService, private router: Router) {}

 canActivate(): Observable<boolean | UrlTree> {
    return this.authService.checkSession().pipe(
      map(user => {
        if (user.role === 'ADMIN') {
          return true;
        } else {
          return this.router.parseUrl('/unauthorized'); // or redirect to home
        }
      }),
      catchError(() => of(this.router.parseUrl('/login')))
    );
  }
}
