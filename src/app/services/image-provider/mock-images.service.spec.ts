import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockImagesService } from './mock-images.service';

describe('MockImagesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return a typed image list', async () => {
    const service = TestBed.inject(MockImagesService);
    const images = await firstValueFrom(service.getImages());

    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        url: expect.any(String),
      }),
    );
  });

  it('should return undefined for a missing image id', async () => {
    const service = TestBed.inject(MockImagesService);
    const image = await firstValueFrom(service.getImageById('missing-id'));

    expect(image).toBeUndefined();
  });
});
