import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {AuthService} from './auth/auth.service';
import {LoggingService} from './logging.service';
import {Store} from '@ngrx/store';

import * as fromApp from './store/app.reducer';
import * as AuthActions from './auth/store/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private store: Store<fromApp.AppState>,
              private loggingService: LoggingService,
              @Inject(PLATFORM_ID) private platformId) {
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // only dispatch the loging if we are in the browser
      this.store.dispatch(AuthActions.autoLogin());
    }
    this.loggingService.printLog('HELLO FROM AppComponent NgOnIt');
  }

}
