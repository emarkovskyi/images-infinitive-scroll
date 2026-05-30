import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { delay, Observable, of } from 'rxjs';
import { App } from './app';
import { appConfig } from './app.config';
import { ImageItem } from './services/image-provider/image-item.interface';
import {
  ImagesService,
  ListImagesParams,
  PaginatedImagesResponse,
} from './services/image-provider/images-service.interface';
import { FavoritesState } from './services/favorites/favorites-state.interface';
import { FAVORITES_STATE } from './services/favorites/favorites-state.token';
import { IMAGES_SERVICE } from './services/image-provider/images-service.token';

const FAVORITES_STORAGE_KEY = 'images-infinitive-scroll.favorites';

class MockIntersectionObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(public readonly callback: IntersectionObserverCallback) {}
}

const TEST_IMAGES: ImageItem[] = Array.from({ length: 25 }, (_, index) => ({
  id: `${1000 + index}`,
  title: `Author ${index + 1} ${1000 + index}`,
  url: `https://picsum.photos/id/${1000 + index}/1200/900`,
  description: `Seeded Picsum image ${1000 + index} by Author ${index + 1}, sized 5000 by 3333.`,
}));

class FakeImagesService implements ImagesService {
  listImages(params?: ListImagesParams): Observable<PaginatedImagesResponse> {
    const limit = params?.limit ?? 20;
    const startIndex = params?.cursor ? Number.parseInt(params.cursor.replace('idx:', ''), 10) : 0;
    const items = TEST_IMAGES.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + items.length;
    const hasNextPage = nextIndex < TEST_IMAGES.length;

    return of({
      items,
      pageInfo: {
        nextCursor: hasNextPage ? `idx:${nextIndex}` : null,
        hasNextPage,
      },
    }).pipe(delay(300));
  }

  getImageById(id: string): Observable<ImageItem | undefined> {
    return of(TEST_IMAGES.find((image) => image.id === id)).pipe(delay(300));
  }
}

describe('App', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;
  let router: Router;
  let favoritesState: FavoritesState;

  async function configureAppTestingModule(): Promise<void> {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers, { provide: IMAGES_SERVICE, useClass: FakeImagesService }],
    }).compileComponents();

    router = TestBed.inject(Router);
    favoritesState = TestBed.inject(FAVORITES_STATE);
  }

  async function waitForData(fixture: ComponentFixture<App>): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.clear();
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    localStorage.clear();
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  beforeEach(async () => {
    await configureAppTestingModule();
  });

  async function renderAt(url: string): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await waitForData(fixture);
    return fixture.nativeElement as HTMLElement;
  }

  it('should create the app shell', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render the header and the shell outlet', async () => {
    const compiled = await renderAt('/');

    expect(compiled.querySelector('app-header')).not.toBeNull();
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('should highlight the favorites tab on /favorites', async () => {
    const compiled = await renderAt('/favorites');
    const activeTab = compiled.querySelector('app-header .app-button--active');

    expect(activeTab?.textContent?.trim()).toBe('Favorites');
  });

  it('should keep Photos active on the details route', async () => {
    const compiled = await renderAt('/photos/1000');
    const activeTab = compiled.querySelector('app-header .app-button--active');

    expect(activeTab?.textContent?.trim()).toBe(undefined);
  });

  it('should navigate to favorites when the Favorites button is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await waitForData(fixture);

    const buttons = fixture.nativeElement.querySelectorAll('app-header app-button button');
    buttons[1]?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/favorites');
  });

  it('should render the image list page on /', async () => {
    const compiled = await renderAt('/');

    expect(compiled.querySelector('.image-list')).not.toBeNull();
    expect(compiled.querySelectorAll('.image-list__item').length).toBe(20);
  });

  it('should add a clicked photo to favorites and stay on /', async () => {
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await waitForData(fixture);

    const firstPhotoButton = fixture.nativeElement.querySelector('.image-list__button');
    firstPhotoButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/');
    expect(favoritesState.isFavorite('1000')).toBe(true);
  });

  it('should render the photo details page for a valid image id', async () => {
    const compiled = await renderAt('/photos/1000');

    expect(compiled.querySelector('img')).not.toBeNull();
    expect(compiled.querySelector('.photo-details-page__actions')).not.toBeNull();
    expect(compiled.querySelector('app-button.photo-details-page__remove')).not.toBeNull();
    expect(
      (compiled.querySelector('.photo-details-page__remove button') as HTMLButtonElement | null)
        ?.disabled,
    ).toBe(true);
  });

  it('should render a not-found state for a missing image id', async () => {
    const compiled = await renderAt('/photos/does-not-exist');

    expect(compiled.querySelector('app-loading-label')).not.toBeNull();
    expect(compiled.textContent).toContain('This photo could not be found.');
  });

  it('should render only favorite images on /favorites', async () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['1004']));
    await configureAppTestingModule();
    const compiled = await renderAt('/favorites');
    const buttons = compiled.querySelectorAll<HTMLButtonElement>('.image-list__button');

    expect(buttons.length).toBe(1);
    expect(buttons[0]?.getAttribute('aria-label')).toBe('Open Author 5 1004');
    expect(favoritesState.getFavoriteIds()).toEqual(['1004']);
  });

  it('should not add the list scroll container to the details route', async () => {
    const compiled = await renderAt('/photos/1000');

    expect(compiled.querySelector('.photo-details-page .page__scroll-region')).toBeNull();
  });

  it('should remove a photo from favorites on the details page and stay on that route', async () => {
    favoritesState.add('1000');
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/photos/1000');
    fixture.detectChanges();
    await waitForData(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const removeButton = compiled.querySelector('.photo-details-page__remove button') as
      | HTMLButtonElement
      | null;
    removeButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/photos/1000');
    expect(favoritesState.isFavorite('1000')).toBe(false);
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(JSON.stringify([]));
    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
  });
});
