import { Component } from '@angular/core';

import { VoiceControlComponent } from './voice/voice-control.component';
import { HealthDashboardComponent } from './components/health-dashboard.component';

@Component({
  selector: 'app-root',
  imports: [VoiceControlComponent, HealthDashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'VoiceWell - Your Smart Health Navigator';
}
