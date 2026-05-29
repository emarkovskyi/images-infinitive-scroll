import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ViewportEnterDirective } from './viewport-enter.directive';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(
    public readonly callback: IntersectionObserverCallback,
    public readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }
}

@Component({
  imports: [ViewportEnterDirective],
  template: `
    <div viewportEnter (viewPortEntered)="enteredCount = enteredCount + 1">Observed element</div>
  `,
})
class TestHostComponent {
  enteredCount = 0;
}

describe('ViewportEnterDirective', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
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

  it('should create and observe the host element', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(MockIntersectionObserver.instances.length).toBe(1);
    expect(MockIntersectionObserver.instances[0].observe).toHaveBeenCalledTimes(1);
  });

  it('should emit when an entry is intersecting', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const observer = MockIntersectionObserver.instances[0];
    observer.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.enteredCount).toBe(1);
  });

  it('should not emit when an entry is not intersecting', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const observer = MockIntersectionObserver.instances[0];
    observer.callback(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.enteredCount).toBe(0);
  });

  it('should disconnect the observer on destroy', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const observer = MockIntersectionObserver.instances[0];
    fixture.destroy();

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
