import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

@Component({
  imports: [ButtonComponent],
  template: `
    <app-button
      [active]="active"
      [disabled]="disabled"
      [variant]="variant"
      (pressed)="pressed = true"
    >
      Test action
    </app-button>
  `,
})
class TestHostComponent {
  active = false;
  disabled = false;
  variant: 'primary' | 'secondary' = 'secondary';
  pressed = false;
}

describe('ButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  it('should render projected text', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Test action');
  });

  it('should render the primary variant with Material flat button classes', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.variant = 'primary';
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button');

    expect(button.className).toContain('mat-mdc-unelevated-button');
    expect(button.className).toContain('app-button--primary');
  });

  it('should render the secondary variant with Material stroked button classes', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.variant = 'secondary';
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button');

    expect(button.className).toContain('mat-mdc-outlined-button');
    expect(button.className).toContain('app-button--secondary');
  });

  it('should apply the active class when requested', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.active = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button');

    expect(button.className).toContain('app-button--active');
  });

  it('should respect the disabled state', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLButtonElement | null;

    expect(button?.disabled).toBe(true);
  });

  it('should keep disabled primary buttons visually marked with disabled hooks', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.variant = 'primary';
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLButtonElement | null;

    expect(button?.className).toContain('app-button--primary');
    expect(button?.disabled).toBe(true);
  });

  it('should keep disabled secondary buttons visually marked with disabled hooks', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.variant = 'secondary';
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLButtonElement | null;

    expect(button?.className).toContain('app-button--secondary');
    expect(button?.disabled).toBe(true);
  });

  it('should emit pressed when enabled', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLButtonElement | null;
    button?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.pressed).toBe(true);
  });

  it('should not emit pressed when disabled', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLButtonElement | null;
    button?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.pressed).toBe(false);
  });
});
