import { InjectionToken } from '@angular/core';
import { FavoritesState } from './favorites-state.interface';

export const FAVORITES_STATE = new InjectionToken<FavoritesState>('FAVORITES_STATE');
