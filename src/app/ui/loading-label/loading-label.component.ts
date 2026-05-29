import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-label',
  templateUrl: './loading-label.component.html',
  styleUrl: './loading-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingLabelComponent {
  readonly label = input('Loading content...');
  readonly mode = input<'loading' | 'empty' | 'error'>('loading');
}
