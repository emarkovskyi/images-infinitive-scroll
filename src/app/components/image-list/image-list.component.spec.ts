import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ImageItem } from '../../services/image-provider/image-item.interface';
import { ImageListComponent } from './image-list.component';

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
    ></app-image-list>
  `,
})
class TestHostComponent {
  images = TEST_IMAGES;
  lastSelected = '';
}

describe('ImageListComponent', () => {
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
});
