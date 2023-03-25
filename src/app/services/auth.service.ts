import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User, LoginResult } from '../models/user.model';

import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private SERVER_URL = environment.SERVER_URL
  constructor(private http: HttpClient) { }

  public login(email: string, password: string): Observable<LoginResult> {
    return this.http.post<LoginResult>(this.SERVER_URL + 'auth/login', { email: email, password: password }).pipe(tap(res => this.setSession(res.access_token)), shareReplay(), catchError((err) => {
      return throwError(() => err)
    }))
  }

  // public register(email: string, passsword: string): Observable<User> {
  //   return this.http.post<any>(this.SERVER_URL + 'auth/register', { email: email, password: passsword })
  // }
  private setSession(token: string) {

    const expiresAt = moment().add(360000, 'second');
    localStorage.setItem('id_token', token)
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()))
  }

  public logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }
  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }
  private getExpiration() {
    const expiration = localStorage.getItem("expires_at");
    if (expiration)
      return moment(JSON.parse(expiration));
    else return 0
  }


}
