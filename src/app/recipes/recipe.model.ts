import {Ingredient} from '../shared/Ingredient';

export class Recipe {
  public name: string;
  public desc: string;
  public imgSrc: string;
  public ingredients: Ingredient[];

  constructor(name: string, desc: string, imgSrc: string, ingredients: Ingredient[]) {
    this.name = name;
    this.desc = desc;
    this.imgSrc = imgSrc;
    this.ingredients = ingredients;
  }
}
