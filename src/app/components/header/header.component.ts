import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ButtonComponent } from '../../ui/button/button.component';

type HeaderView = 'photos' | 'favorites' | '';

@Component({
  selector: 'app-header',
  imports: [ButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly activeView = computed<HeaderView>(() =>
    this.currentUrl().startsWith('/favorites')
      ? 'favorites'
      : !this.currentUrl().startsWith('/photos')
        ? 'photos'
        : '',
  );

  protected goToPhotos(): void {
    void this.router.navigateByUrl('/');
  }

  protected goToFavorites(): void {
    void this.router.navigateByUrl('/favorites');
  }
}
