import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <main id="main-content" tabindex="-1">
        <router-outlet #outlet="outlet"></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      position: relative;
      min-height: 100vh;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent { }