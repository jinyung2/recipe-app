import {Action} from '@ngrx/store';
import {Ingredient} from '../../shared/Ingredient';

export const ADD_INGREDIENT = 'ADD_INGREDIENT';

export class AddIngredient implements  Action {
  // readonly: typescript feature that ensures data is never changed from outside.
  readonly type = ADD_INGREDIENT;
  payload: Ingredient;
}
