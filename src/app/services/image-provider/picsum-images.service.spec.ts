import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { PicsumImagesService } from './picsum-images.service';

const PICSUM_LIST_URL = 'https://picsum.photos/v2/list?page=10&limit=100';

const PICSUM_RESPONSE = Array.from({ length: 100 }, (_, index) => ({
  id: `${1000 + index}`,
  author: `Author ${index + 1}`,
  width: 5000,
  height: 3333,
  url: `https://picsum.photos/id/${1000 + index}/info`,
  download_url: `https://picsum.photos/id/${1000 + index}/5000/3333`,
}));

describe('PicsumImagesService', () => {
  let service: PicsumImagesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PicsumImagesService],
    });

    service = TestBed.inject(PicsumImagesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should map seeded Picsum records into typed image items', async () => {
    const responsePromise = firstValueFrom(service.listImages());

    const request = httpMock.expectOne(PICSUM_LIST_URL);
    request.flush(PICSUM_RESPONSE);

    const response = await responsePromise;

    expect(response.items).toHaveLength(20);
    expect(response.items[0]).toEqual({
      id: '1000',
      title: 'Author 1 1000',
      url: 'https://picsum.photos/id/1000/1200/900',
      description: 'Seeded Picsum image 1000 by Author 1, sized 5000 by 3333.',
    });
    expect(response.pageInfo).toEqual({
      nextCursor: 'idx:20',
      hasNextPage: true,
    });
  });

  it('should return a non-overlapping next page for a passed cursor', async () => {
    const firstPagePromise = firstValueFrom(service.listImages());

    httpMock.expectOne(PICSUM_LIST_URL).flush(PICSUM_RESPONSE);
    const firstPage = await firstPagePromise;

    const secondPage = await firstValueFrom(
      service.listImages({ cursor: firstPage.pageInfo.nextCursor, limit: 20 }),
    );

    expect(secondPage.items).toHaveLength(20);
    expect(secondPage.items[0]?.id).toBe('1020');
    expect(secondPage.pageInfo).toEqual({
      nextCursor: 'idx:40',
      hasNextPage: true,
    });
  });

  it('should return no next cursor on the last page', async () => {
    const responsePromise = firstValueFrom(service.listImages({ limit: 50 }));

    httpMock.expectOne(PICSUM_LIST_URL).flush(PICSUM_RESPONSE);
    const response = await responsePromise;
    const secondPage = await firstValueFrom(
      service.listImages({ cursor: response.pageInfo.nextCursor, limit: 50 }),
    );

    expect(secondPage.items).toHaveLength(50);
    expect(secondPage.pageInfo).toEqual({
      nextCursor: null,
      hasNextPage: false,
    });
  });

  it('should resolve an existing seeded image id and return undefined for a missing id', async () => {
    const existingImagePromise = firstValueFrom(service.getImageById('1007'));

    httpMock.expectOne(PICSUM_LIST_URL).flush(PICSUM_RESPONSE);
    const existingImage = await existingImagePromise;
    const missingImage = await firstValueFrom(service.getImageById('missing-id'));

    expect(existingImage?.id).toBe('1007');
    expect(missingImage).toBeUndefined();
  });

  it('should share a single in-flight seed request across concurrent callers', async () => {
    const firstCall = firstValueFrom(service.listImages());
    const secondCall = firstValueFrom(service.getImageById('1001'));

    const request = httpMock.expectOne(PICSUM_LIST_URL);
    request.flush(PICSUM_RESPONSE);

    const [firstPage, image] = await Promise.all([firstCall, secondCall]);

    expect(firstPage.items[0]?.id).toBe('1000');
    expect(image?.id).toBe('1001');
  });

  it('should surface a seed-fetch failure to callers', async () => {
    const responsePromise = firstValueFrom(service.listImages());

    const request = httpMock.expectOne(PICSUM_LIST_URL);
    request.flush('Network error', {
      status: 500,
      statusText: 'Server Error',
    });

    await expect(responsePromise).rejects.toBeTruthy();
  });
});
