import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';
import { FavoritesStateService } from './services/favorites/favorites-state.service';

describe('App', () => {
  let router: Router;
  let favoritesState: FavoritesStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers],
    }).compileComponents();

    router = TestBed.inject(Router);
    favoritesState = TestBed.inject(FavoritesStateService);
  });

  async function renderAt(url: string): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
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
    const compiled = await renderAt('/photos/coastline-dawn');
    const activeTab = compiled.querySelector('app-header .app-button--active');

    expect(activeTab?.textContent?.trim()).toBe('Photos');
  });

  it('should navigate to favorites when the Favorites button is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

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
    expect(compiled.querySelectorAll('.image-list__item').length).toBeGreaterThan(0);
  });

  it('should add a clicked photo to favorites and navigate to details from /', async () => {
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const firstPhotoButton = fixture.nativeElement.querySelector('.image-list__button');
    firstPhotoButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/photos/coastline-dawn');
    expect(favoritesState.isFavorite('coastline-dawn')).toBe(true);
  });

  it('should render the photo details page for a valid image id', async () => {
    const compiled = await renderAt('/photos/coastline-dawn');

    expect(compiled.querySelector('.photo-details-page')).not.toBeNull();
    expect(compiled.querySelector('app-image-card')).not.toBeNull();
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
    favoritesState.add('forest-road');
    const compiled = await renderAt('/favorites');

    const buttons = compiled.querySelectorAll<HTMLButtonElement>('.image-list__button');

    expect(buttons.length).toBe(1);
    expect(buttons[0]?.getAttribute('aria-label')).toBe('Open Forest Road');
  });

  it('should remove a photo from favorites on the details page and stay on that route', async () => {
    favoritesState.add('coastline-dawn');
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/photos/coastline-dawn');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const removeButton = compiled.querySelector('.photo-details-page__remove button') as
      | HTMLButtonElement
      | null;
    removeButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/photos/coastline-dawn');
    expect(favoritesState.isFavorite('coastline-dawn')).toBe(false);
    expect(fixture.nativeElement.querySelector('app-image-card')).not.toBeNull();
  });
});
