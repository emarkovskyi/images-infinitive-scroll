import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ImageItem } from './image-item.interface';
import { ImagesService } from './images-service.interface';

const MOCK_IMAGES: ImageItem[] = [
  {
    id: 'coastline-dawn',
    title: 'Coastline Dawn',
    url: 'https://picsum.photos/id/1011/1200/800',
    description: 'A calm shoreline with soft morning light and wide open space.',
  },
  {
    id: 'forest-road',
    title: 'Forest Road',
    url: 'https://picsum.photos/id/1040/1200/800',
    description: 'A road disappearing into the forest canopy with deep green tones.',
  },
  {
    id: 'desert-curves',
    title: 'Desert Curves',
    url: 'https://picsum.photos/id/1002/1200/800',
    description: 'Layered sand patterns and warm texture ideal for detail previews.',
  },
  {
    id: 'mountain-lake',
    title: 'Mountain Lake',
    url: 'https://picsum.photos/id/1036/1200/800',
    description: 'Crisp mountain reflections that work well for favorites and hero shots.',
  },
  {
    id: 'city-night',
    title: 'City Night',
    url: 'https://picsum.photos/id/1060/1200/800',
    description: 'Urban lights and contrast-heavy framing for a distinct list item.',
  },
];

@Injectable({
  providedIn: 'root',
})
export class MockImagesService implements ImagesService {
  getImages(): Observable<ImageItem[]> {
    return of(MOCK_IMAGES);
  }

  getImageById(id: string): Observable<ImageItem | undefined> {
    return of(MOCK_IMAGES.find((image) => image.id === id));
  }
}
