import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseResponse } from '../../models/BaseResponse.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  BASE_URL = `${environment.apiUrl}`;

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/login`, credentials, {
      withCredentials: true  // important for session cookies
    }).pipe(
      tap(() => this.loadUser())
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.userSubject.next(null);
      })
    );
  }

  loadUser() {
    this.checkSession().subscribe({
      next: (user) => this.userSubject.next(user),
      error: () => this.userSubject.next(null)
    });
  }

  checkSession(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/users/me`, {withCredentials: true});
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }

  registeration(data:any): Observable<any> {
   return this.http.post(`${this.BASE_URL}/auth/register`, {...data});
  }


  sendVerificationEmail(): Observable<BaseResponse<string>>{
    return this.http.get<BaseResponse<string>>(`${this.BASE_URL}/auth/send-verification-email`,{withCredentials:true});
  }

}
