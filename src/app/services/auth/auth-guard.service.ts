import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {  CanActivate,  Router, UrlTree  } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{
    BASE_URL = `${environment.apiUrl}`;

  constructor(private authService:AuthService, private router:Router) { }

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.checkSession().pipe(
      map(()=> true),
      catchError(() => of(this.router.parseUrl('/login')))
    )
  }



}
