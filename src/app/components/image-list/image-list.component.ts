import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageItem } from '../../services/image-provider/image-item.interface';
import { LoadingLabelComponent } from '../../ui/loading-label/loading-label.component';
import { ImageCardComponent } from '../image-card/image-card.component';
import { ViewportEnterDirective } from '../../ui/viewport-enter/viewport-enter.directive';

@Component({
  selector: 'app-image-list',
  imports: [ImageCardComponent, LoadingLabelComponent, ViewportEnterDirective],
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageListComponent {
  readonly images = input.required<ImageItem[]>();
  readonly infiniteScroll = input(false);
  readonly emptyLabel = input($localize`:@@imageList.emptyLabel:No images available right now.`);
  readonly imageSelected = output<string>();
  readonly loadMoreRequested = output<void>();

  protected openImageAriaLabel(title: string): string {
    return $localize`:@@imageList.openImage:Open ${title}:title:`;
  }

  protected selectImage(imageId: string): void {
    this.imageSelected.emit(imageId);
  }

  protected onEnterViewport(isLast: boolean): void {
    if (this.infiniteScroll() && isLast) {
      this.loadMoreRequested.emit();
    }
  }
}
