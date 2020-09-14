import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {of, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../user.model';
import {AuthService} from '../auth.service';

export interface AuthResponseData {
  // kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuth = (expiresIn: number, email: string, userId: string, token: string) => {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return AuthActions.authenticateSuccess({
    email,
    userId,
    token,
    expirationDate,
    redirect: true
  });
};

const handleError = (errorRes: any) => {
  let error = 'An unknown error has occurred!';
  if (!errorRes.error || !errorRes.error.error) {
    return of(AuthActions.authenticateFail({errorMessage: error}));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      error = 'This email already exists.';
      break;
    case 'EMAIL_NOT_FOUND':
      error = 'Email not registered.';
      break;
    case 'INVALID_PASSWORD':
      error = 'Password is invalid.';
      break;
    default:
      error = 'An Error has occurred!';
      break;
  }
  return of(AuthActions.authenticateFail({errorMessage: error}));
};

@Injectable()
export class AuthEffects {
  authSignup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signupStart),
      switchMap(action => {
        return this.http.post<AuthResponseData>(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
          {
            email: action.email,
            password: action.password,
            returnSecureToken: true
          }).pipe(
          tap(resData => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000);
          }),
          map(resData => {
            return handleAuth(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
          }),
          catchError(errorRes => {
            return handleError(errorRes);
          }),
        );
      })
    ));
  //
  // @Effect()
  // authSignup = this.actions$.pipe(
  //   ofType(AuthActions.SIGNUP_START),
  //   switchMap((signupAction: AuthActions.SignUpStart) => {
  //     return this.http.post<AuthResponseData>(
  //       `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
  //       {
  //         email: signupAction.payload.email,
  //         password: signupAction.payload.password,
  //         returnSecureToken: true
  //       }).pipe(
  //       tap(resData => {
  //         this.authService.setLogoutTimer(+resData.expiresIn * 1000);
  //       }),
  //       map(resData => {
  //         return handleAuth(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
  //       }),
  //       catchError(errorRes => {
  //         return handleError(errorRes);
  //       }),
  //     );
  //   })
  // );
  
  authLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap(action => {
        return this.http.post<AuthResponseData>(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
          {
            email: action.email,
            password: action.password,
            returnSecureToken: true
          }).pipe(
          tap(resData => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000);
          }),
          map(resData => {
            return handleAuth(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
          }),
          catchError(errorRes => {
            return handleError(errorRes);
          }),
        );
      })
    ));

  // @Effect()
  // authLogin = this.actions$.pipe(
  //   ofType(AuthActions.LOGIN_START),
  //   switchMap((authData: AuthActions.LoginStart) => {
  //     return this.http.post<AuthResponseData>(
  //       `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
  //       {
  //         email: authData.payload.email,
  //         password: authData.payload.password,
  //         returnSecureToken: true
  //       }).pipe(
  //       tap(resData => {
  //         this.authService.setLogoutTimer(+resData.expiresIn * 1000);
  //       }),
  //       map(resData => {
  //         return handleAuth(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
  //       }),
  //         catchError(errorRes => {
  //           return handleError(errorRes);
  //         }),
  //     );
  //   }),
  // );

  authRedirect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.authenticateSuccess),
      tap(action =>  action.redirect && this.router.navigate(['/']))
    ), { dispatch: false }
  );
  // @Effect({dispatch: false})
  // authRedirect = this.actions$.pipe(ofType(AuthActions.AUTHENTICATE_SUCCESS),
  //   tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
  //     if (authSuccessAction.payload.redirect) {
  //       this.router.navigate(['/']);
  //     }
  // }));


  autoLogin = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLogin),
      map(() => {
        const userData: {
          email: string;
          id: string;
          _token: string;
          _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          return {type: 'DUMMY'};
        }
        const loadedUser = new User(
          userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate)
        );
        if (loadedUser.token) {
          const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
          this.authService.setLogoutTimer(expirationDuration);
          // this.user.next(loadedUser);
          return AuthActions.authenticateSuccess({
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false},
          );
          // const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
          // this.autoLogout(expirationDuration);
        }
        return {type: 'DUMMY'};
      })
    ));

  // @Effect()
  // autoLogin = this.actions$.pipe(
  //   ofType(AuthActions.AUTO_LOGIN),
  //   map(() => {
  //     const userData: {
  //       email: string;
  //       id: string;
  //       _token: string;
  //       _tokenExpirationDate: string;
  //     } = JSON.parse(localStorage.getItem('userData'));
  //     if (!userData) {
  //       return {type: 'DUMMY'};
  //     }
  //     const loadedUser = new User(
  //       userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate)
  //     );
  //     if (loadedUser.token) {
  //       const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
  //       this.authService.setLogoutTimer(expirationDuration);
  //       // this.user.next(loadedUser);
  //       return new AuthActions.AuthenticateSuccess({
  //         email: loadedUser.email,
  //         userId: loadedUser.id,
  //         token: loadedUser.token,
  //         expirationDate: new Date(userData._tokenExpirationDate),
  //         redirect: false},
  //       );
  //       // const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
  //       // this.autoLogout(expirationDuration);
  //     }
  //     return {type: 'DUMMY'};
  //   })
  // );

  authLogout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.clearLogoutTimer();
        localStorage.removeItem('userData');
        this.router.navigate(['/auth']);
      })), { dispatch: false }
);
  // @Effect({dispatch: false})
  // authLogout = this.actions$.pipe(ofType(AuthActions.LOGOUT), tap(() => {
  //   this.authService.clearLogoutTimer();
  //   localStorage.removeItem('userData');
  //   this.router.navigate(['/auth']);
  // }));

  constructor(private actions$: Actions,
              private http: HttpClient,
              private router: Router,
              private authService: AuthService) {
  }
}
