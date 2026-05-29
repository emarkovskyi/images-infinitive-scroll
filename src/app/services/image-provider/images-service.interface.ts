import { Observable } from 'rxjs';
import { ImageItem } from './image-item.interface';

export interface ImagesService {
  getImages(): Observable<ImageItem[]>;
  getImageById(id: string): Observable<ImageItem | undefined>;
}
