import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ImageItem } from '../../services/image-provider/image-item.interface';

@Component({
  selector: 'app-image-card',
  imports: [MatCardModule],
  templateUrl: './image-card.component.html',
  styleUrl: './image-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCardComponent {
  readonly image = input.required<ImageItem>();
}
