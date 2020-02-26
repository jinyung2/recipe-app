import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import * as RecipeActions from './recipe.actions';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {Recipe} from '../recipe.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import {Observable} from 'rxjs';

@Injectable()
export class RecipeEffects {
  fetchRecipes$ = createEffect(() =>
    this.actions$.pipe(
    ofType(RecipeActions.fetchRecipes),
      switchMap(action => {
        return this.http.get<Recipe[]>(
          'https://ng-recipe-app-1707f.firebaseio.com/recipes.json');
      }),
      map((recipes: Recipe[]) => {
        return recipes.map(recipe => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : []
          };
        });
      }),
      map((recipes: Recipe[]) => {
        return RecipeActions.setRecipes({recipes});
      })
    ));

  // @Effect()
  // fetchRecipes = this.actions$.pipe(
  //   ofType(RecipeActions.FETCH_RECIPES),
  //   switchMap(fetchAction => {
  //     return this.http.get<Recipe[]>(
  //       'https://ng-recipe-app-1707f.firebaseio.com/recipes.json');
  //   }),
  //   map(recipes => {
  //     return recipes.map(recipe => {
  //       return {
  //         ...recipe,
  //         ingredients: recipe.ingredients ? recipe.ingredients : []
  //       };
  //     });
  //   }),
  //   map(recipes => {
  //     return new RecipeActions.SetRecipes(recipes);
  //   })
  // );

  storeRecipes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipeActions.storeRecipes),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([actionData, recipesState]) => {
        return this.http.put(
          'https://ng-recipe-app-1707f.firebaseio.com/recipes.json',
          recipesState.recipes);
      })),
    {dispatch: false});
  // @Effect({dispatch: false})
  // storeRecipes = this.actions$.pipe(
  //   ofType(RecipeActions.STORE_RECIPES),
  //   withLatestFrom(this.store.select('recipes')),
  //   switchMap(([actionData, recipesState]) => {
  //     return this.http.put(
  //       'https://ng-recipe-app-1707f.firebaseio.com/recipes.json',
  //       recipesState.recipes
  //     );
  //   })
  // );

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromApp.AppState>) {}
}
