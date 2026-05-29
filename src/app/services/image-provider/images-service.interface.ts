import { Observable } from 'rxjs';
import { ImageItem } from './image-item.interface';

export interface ListImagesParams {
  cursor?: string | null;
  limit?: number;
}

export interface PageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface PaginatedImagesResponse {
  items: ImageItem[];
  pageInfo: PageInfo;
}

export interface ImagesService {
  listImages(params?: ListImagesParams): Observable<PaginatedImagesResponse>;
  getImageById(id: string): Observable<ImageItem | undefined>;
}
