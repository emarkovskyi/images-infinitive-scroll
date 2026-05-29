import { TestBed } from '@angular/core/testing';
import { FavoritesStateService } from './favorites-state.service';

describe('FavoritesStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should add and remove favorite ids in memory', () => {
    const service = TestBed.inject(FavoritesStateService);

    service.add('image-a');
    expect(service.isFavorite('image-a')).toBe(true);
    expect(service.getFavoriteIds()).toEqual(['image-a']);

    service.add('image-a');
    expect(service.getFavoriteIds()).toEqual(['image-a']);

    service.remove('image-a');
    expect(service.isFavorite('image-a')).toBe(false);
    expect(service.getFavoriteIds()).toEqual([]);
  });
});
