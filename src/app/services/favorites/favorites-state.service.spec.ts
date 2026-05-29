import { TestBed } from '@angular/core/testing';
import { FAVORITES_STATE } from './favorites-state.token';
import { FavoritesStateService } from './favorites-state.service';

const FAVORITES_STORAGE_KEY = 'images-virtual-scroll.favorites';

describe('FavoritesStateService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FAVORITES_STATE,
          useExisting: FavoritesStateService,
        },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should load saved ids from localStorage on construction', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['image-a', 'image-b']));

    const service = TestBed.inject(FavoritesStateService);

    expect(service.getFavoriteIds()).toEqual(['image-a', 'image-b']);
    expect(service.isFavorite('image-a')).toBe(true);
  });

  it('should fall back to an empty list when nothing is stored', () => {
    const service = TestBed.inject(FavoritesStateService);

    expect(service.getFavoriteIds()).toEqual([]);
  });

  it('should fall back to an empty list for invalid JSON', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '{not-valid-json');

    const service = TestBed.inject(FavoritesStateService);

    expect(service.getFavoriteIds()).toEqual([]);
  });

  it('should fall back to an empty list for an invalid stored shape', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ favoriteIds: ['image-a'] }));

    const service = TestBed.inject(FavoritesStateService);

    expect(service.getFavoriteIds()).toEqual([]);
  });

  it('should add and remove favorite ids in memory and persist them', () => {
    const service = TestBed.inject(FavoritesStateService);

    service.add('image-a');
    expect(service.isFavorite('image-a')).toBe(true);
    expect(service.getFavoriteIds()).toEqual(['image-a']);
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(JSON.stringify(['image-a']));

    service.add('image-a');
    expect(service.getFavoriteIds()).toEqual(['image-a']);
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(JSON.stringify(['image-a']));

    service.remove('image-a');
    expect(service.isFavorite('image-a')).toBe(false);
    expect(service.getFavoriteIds()).toEqual([]);
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(JSON.stringify([]));
  });

  it('should not throw if localStorage access fails during initialization', () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

    const service = TestBed.inject(FavoritesStateService);

    expect(service.getFavoriteIds()).toEqual([]);
    expect(getItemSpy).toHaveBeenCalled();
  });

  it('should not throw if localStorage writes fail', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
    const service = TestBed.inject(FavoritesStateService);

    expect(() => service.add('image-a')).not.toThrow();
    expect(service.getFavoriteIds()).toEqual(['image-a']);
    expect(setItemSpy).toHaveBeenCalled();
  });

  it('should expose the same working implementation through the favorites token', () => {
    const service = TestBed.inject(FavoritesStateService);
    const tokenBackedState = TestBed.inject(FAVORITES_STATE);

    tokenBackedState.add('image-a');

    expect(tokenBackedState.isFavorite('image-a')).toBe(true);
    expect(tokenBackedState.getFavoriteIds()).toEqual(['image-a']);
    expect(service.getFavoriteIds()).toEqual(['image-a']);
  });
});
