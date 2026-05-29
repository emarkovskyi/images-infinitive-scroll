import { Injectable, computed, signal } from '@angular/core';
import { FavoritesState } from './favorites-state.interface';

const FAVORITES_STORAGE_KEY = 'images-infinitive-scroll.favorites';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesStateService implements FavoritesState {
  private readonly favoriteIdsState = signal<string[]>(this.readInitialFavoriteIds());

  readonly favoriteIds = computed(() => this.favoriteIdsState());

  add(id: string): void {
    this.favoriteIdsState.update((favoriteIds) => {
      const nextFavoriteIds = favoriteIds.includes(id) ? favoriteIds : [...favoriteIds, id];
      this.persistFavoriteIds(nextFavoriteIds);
      return nextFavoriteIds;
    });
  }

  remove(id: string): void {
    this.favoriteIdsState.update((favoriteIds) => {
      const nextFavoriteIds = favoriteIds.filter((favoriteId) => favoriteId !== id);
      this.persistFavoriteIds(nextFavoriteIds);
      return nextFavoriteIds;
    });
  }

  isFavorite(id: string): boolean {
    return this.favoriteIdsState().includes(id);
  }

  getFavoriteIds(): string[] {
    return this.favoriteIdsState();
  }

  private readInitialFavoriteIds(): string[] {
    const storage = this.getStorage();

    if (!storage) {
      return [];
    }

    try {
      const storedValue = storage.getItem(FAVORITES_STORAGE_KEY);

      if (!storedValue) {
        return [];
      }

      const parsedValue: unknown = JSON.parse(storedValue);
      return isStringArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  }

  private persistFavoriteIds(favoriteIds: string[]): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    try {
      storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Silent fallback keeps favorites usable even when persistence fails.
    }
  }

  private getStorage(): Storage | null {
    try {
      return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
    } catch {
      return null;
    }
  }
}
