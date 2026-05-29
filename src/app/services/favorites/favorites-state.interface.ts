import { Signal } from '@angular/core';

export interface FavoritesState {
  readonly favoriteIds: Signal<string[]>;
  add(id: string): void;
  remove(id: string): void;
  isFavorite(id: string): boolean;
  getFavoriteIds(): string[];
}
