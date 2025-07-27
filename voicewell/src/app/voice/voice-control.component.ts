import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { VoiceService, VoiceState } from './voice.service';

@Component({
  selector: 'app-voice-control',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="voice-control">
      <div class="voice-status" [class.listening]="voiceState.isListening">
        <div class="microphone-icon" (click)="toggleListening()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
            />
            <path
              d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
            />
          </svg>
        </div>
        <div class="status-text">
          {{
            voiceState.isListening
              ? 'Listening...'
              : voiceState.isSupported
              ? 'Click to start voice commands'
              : 'Voice recognition initializing...'
          }}
        </div>
      </div>

      <div class="voice-commands-help">
        <h4>Try saying:</h4>
        <ul>
          <li>"Show my health dashboard"</li>
          <li>"Show my health assessment" or "Risk assessment"</li>
          <li>"Show my claims" or "Show my vitals"</li>
          <li>"Show my goals" or "Show wellness programs"</li>
          <li class="medication-command">
            "Show my medication" or "Show my provider"
          </li>
          <li>"Show my benefits" or "Show health insights"</li>
          <li>"Show appointment schedule" or "Show my care team"</li>
          <li>"Show fitness goals" or "Show my progress"</li>
          <li>"Show health trends" or "Show recommendations"</li>
          <li>"Show my sleep data" or "Show stress levels"</li>
          <li class="stop-command">"Stop" to stop listening</li>
        </ul>
      </div>

      <div
        class="current-speech"
        *ngIf="voiceState.isListening && voiceState.currentTranscript"
      >
        <div class="transcript-label">What I'm hearing:</div>
        <div class="transcript-text">"{{ voiceState.currentTranscript }}"</div>
      </div>

      <div class="last-command" *ngIf="voiceState.lastCommand">
        <strong>Last command:</strong> {{ voiceState.lastCommand.command }}
        <small>({{ voiceState.lastCommand.confidence | percent }})</small>
      </div>

      <div class="voice-error" *ngIf="voiceState.error">
        <strong>Error:</strong> {{ voiceState.error }}
      </div>

      <div class="listening-animation" *ngIf="voiceState.isListening">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .voice-control {
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        color: white;
        text-align: center;
        position: relative;
        overflow: hidden;
        border: 3px solid #007acc;
        animation: blueBorderBlink 2s infinite;
      }

      @keyframes blueBorderBlink {
        0% {
          border-color: #007acc;
          box-shadow: 0 0 10px rgba(0, 122, 204, 0.5);
        }
        50% {
          border-color: #0099ff;
          box-shadow: 0 0 20px rgba(0, 153, 255, 0.8);
        }
        100% {
          border-color: #007acc;
          box-shadow: 0 0 10px rgba(0, 122, 204, 0.5);
        }
      }

      .voice-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
      }

      .microphone-icon {
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }

      .microphone-icon:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .voice-status.listening .microphone-icon {
        background: rgba(255, 100, 100, 0.8);
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }

      .status-text {
        font-size: 16px;
        font-weight: 500;
      }

      .voice-commands-help {
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 10px;
        text-align: left;
        margin-bottom: 15px;
        backdrop-filter: blur(5px);
      }

      .voice-commands-help h4 {
        margin: 0 0 10px 0;
        color: #ffd700;
      }

      .voice-commands-help ul {
        margin: 0;
        padding-left: 20px;
      }

      .voice-commands-help li {
        margin-bottom: 5px;
        font-size: 14px;
      }

      .stop-command {
        color: #ff6b6b !important;
        font-weight: bold !important;
        border-left: 3px solid #ff6b6b;
        padding-left: 8px;
        margin-top: 8px !important;
      }

      .medication-command {
        color: #4ecdc4 !important;
        font-weight: bold !important;
        padding: 8px 12px;
        margin: 8px 0 !important;
        border-radius: 8px;
        border: 2px solid #4ecdc4;
        background: rgba(78, 205, 196, 0.1);
        animation: medicationBlink 1.5s infinite;
        position: relative;
        overflow: hidden;
      }

      @keyframes medicationBlink {
        0% {
          border-color: #4ecdc4;
          box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
          background: rgba(78, 205, 196, 0.1);
        }
        50% {
          border-color: #26d0ce;
          box-shadow: 0 0 20px rgba(38, 208, 206, 0.8);
          background: rgba(78, 205, 196, 0.2);
        }
        100% {
          border-color: #4ecdc4;
          box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
          background: rgba(78, 205, 196, 0.1);
        }
      }

      .current-speech {
        background: rgba(255, 255, 255, 0.15);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        text-align: center;
        border: 2px dashed rgba(255, 255, 255, 0.3);
        animation: pulse 2s infinite;
      }

      .transcript-label {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .transcript-text {
        font-size: 16px;
        font-weight: bold;
        color: #fff;
        font-style: italic;
      }

      @keyframes pulse {
        0%,
        100% {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.15);
        }
        50% {
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.25);
        }
      }

      .last-command {
        background: rgba(255, 255, 255, 0.1);
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        text-align: left;
      }

      .voice-error {
        background: rgba(255, 100, 100, 0.3);
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        text-align: left;
      }

      .listening-animation {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 3px;
        margin-top: 15px;
      }

      .wave {
        width: 4px;
        height: 20px;
        background: white;
        border-radius: 2px;
        animation: wave 1.2s infinite ease-in-out;
      }

      .wave:nth-child(1) {
        animation-delay: -1.1s;
      }
      .wave:nth-child(2) {
        animation-delay: -1s;
      }
      .wave:nth-child(3) {
        animation-delay: -0.9s;
      }

      @keyframes wave {
        0%,
        40%,
        100% {
          transform: scaleY(0.4);
        }
        20% {
          transform: scaleY(1);
        }
      }
    `,
  ],
})
export class VoiceControlComponent implements OnInit, OnDestroy {
  voiceState: VoiceState = {
    isListening: false,
    isSupported: false,
    lastCommand: null,
    error: null,
    currentTranscript: null,
  };

  private subscription: Subscription = new Subscription();

  constructor(private voiceService: VoiceService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscription.add(
      this.voiceService.voiceState$.subscribe((state) => {
        // Debug logging for UI state changes
        if (state.isListening !== this.voiceState.isListening) {
          console.log('🖥️ UI State Update - isListening:', this.voiceState.isListening, '->', state.isListening);
        }
        this.voiceState = state;
        
        // Force change detection to ensure the animation updates immediately
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleListening(): void {
    // Play click sound
    this.playClickSound();

    if (!this.voiceState.isSupported) {
      alert(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    if (this.voiceState.isListening) {
      this.voiceService.stopListening();
    } else {
      this.voiceService.startListening();
    }
  }

  private playClickSound(): void {
    try {
      // Create a Web Audio API context for the click sound
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create oscillator for a pleasant click sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure the sound (a brief beep)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher pitch
      oscillator.frequency.exponentialRampToValueAtTime(
        400,
        audioContext.currentTime + 0.1
      );

      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.3,
        audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.1
      );

      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Fallback: console notification if audio fails
      console.log('🎵 Voice control clicked');
    }
  }
}
