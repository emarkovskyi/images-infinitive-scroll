import { TestBed } from '@angular/core/testing';
import { LoadingLabelComponent } from './loading-label.component';

describe('LoadingLabelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingLabelComponent],
    }).compileComponents();
  });

  it('should render the provided label and mode', async () => {
    const fixture = TestBed.createComponent(LoadingLabelComponent);
    fixture.componentRef.setInput('label', 'Waiting for images');
    fixture.componentRef.setInput('mode', 'empty');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Waiting for images');
    expect(compiled.textContent).toContain('empty');
  });
});
