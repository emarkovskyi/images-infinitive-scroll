import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ImageItem } from '../../services/image-provider/image-item.interface';
import { ImageListComponent } from './image-list.component';

class MockIntersectionObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(public readonly callback: IntersectionObserverCallback) {}
}

const TEST_IMAGES: ImageItem[] = [
  {
    id: 'image-a',
    title: 'Image A',
    url: 'https://example.com/a.jpg',
    description: 'First image',
  },
];

@Component({
  imports: [ImageListComponent],
  template: `
    <app-image-list
      [images]="images"
      (imageSelected)="lastSelected = $event"
      (loadMoreRequested)="loadMoreCount = loadMoreCount + 1"
    ></app-image-list>
  `,
})
class TestHostComponent {
  images = TEST_IMAGES;
  lastSelected = '';
  loadMoreCount = 0;
}

describe('ImageListComponent', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  it('should render passed images and emit image selection', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector<HTMLButtonElement>('.image-list__button');

    expect(compiled.querySelectorAll('.image-list__item').length).toBe(1);
    expect(button?.getAttribute('aria-label')).toBe('Open Image A');
    expect(compiled.textContent).not.toContain('Open details');
    expect(compiled.textContent).not.toContain('Add favorite');

    button?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.lastSelected).toBe('image-a');
  });

  it('should request more items only when the last image enters the viewport', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const imageListComponent = fixture.debugElement.children[0].componentInstance as ImageListComponent;

    imageListComponent['onEnterViewport'](false);
    imageListComponent['onEnterViewport'](true);

    expect(fixture.componentInstance.loadMoreCount).toBe(1);
  });
});
