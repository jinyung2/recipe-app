import {Component, OnDestroy, OnInit} from '@angular/core';
import {Ingredient} from '../shared/Ingredient';
// import {ShoppingListService} from './shopping-list.service';
import {Observable, Subscription} from 'rxjs';
// import {LoggingService} from '../logging.service';
import {Store} from '@ngrx/store';

import * as ShoppingListActions from './store/shopping-list-actions';
import * as fromApp from '../store/app.reducer';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list-component.css'],

})
export class ShoppingListComponent implements OnInit, OnDestroy {
  // Commented: Previous Approach using Services for State
  // ingredients: Ingredient[];
  ingredients: Observable<{ingredients: Ingredient[]}>;
  // private ingChangedSub: Subscription;
  constructor(
    // private slService: ShoppingListService, private loggingService: LoggingService,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit() {
    this.ingredients = this.store.select('shoppingList');
    // this.ingredients = this.slService.getIngredients();
    // this.ingChangedSub = this.slService.ingredientsChanged.subscribe(
    //   (ingredients: Ingredient[]) => {
    //     this.ingredients = ingredients;
    //   });
    // this.loggingService.printLog('Hello from ShoppingListComponent NgOnInit');
  }

  ngOnDestroy(): void {
    // this.ingChangedSub.unsubscribe();
  }

  onEditItem(index: number) {
    this.store.dispatch(new ShoppingListActions.StartEdit(index));
  }
}
