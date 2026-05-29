import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoritesStateService {
  private readonly favoriteIdsState = signal<string[]>([]);

  readonly favoriteIds = computed(() => this.favoriteIdsState());

  add(id: string): void {
    this.favoriteIdsState.update((favoriteIds) =>
      favoriteIds.includes(id) ? favoriteIds : [...favoriteIds, id],
    );
  }

  remove(id: string): void {
    this.favoriteIdsState.update((favoriteIds) =>
      favoriteIds.filter((favoriteId) => favoriteId !== id),
    );
  }

  isFavorite(id: string): boolean {
    return this.favoriteIdsState().includes(id);
  }

  getFavoriteIds(): string[] {
    return this.favoriteIdsState();
  }
}
