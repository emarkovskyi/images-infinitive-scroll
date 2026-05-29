import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [MatButtonModule, NgTemplateOutlet],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary'>('secondary');
  readonly active = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly pressed = output<void>();

  protected onClick(): void {
    if (!this.disabled()) {
      this.pressed.emit();
    }
  }
}
