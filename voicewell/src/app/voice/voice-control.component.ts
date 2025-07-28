import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { VoiceService, VoiceState } from './voice.service';

@Component({
  selector: 'app-voice-control',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="voice-control"
      role="region"
      aria-labelledby="voice-control-title"
    >
      <h2 id="voice-control-title" class="sr-only">Voice Control Interface</h2>
      <div
        class="voice-status"
        [class.listening]="voiceState.isListening"
        role="status"
        aria-live="polite"
      >
        <div class="voice-control-header">
          <button
            class="microphone-icon"
            (click)="toggleListening()"
            type="button"
            [attr.aria-label]="
              voiceState.isListening
                ? 'Stop voice recognition'
                : 'Start voice recognition'
            "
            [attr.aria-pressed]="voiceState.isListening"
            [disabled]="!voiceState.isSupported"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="img"
              aria-hidden="true"
            >
              <path
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
              />
              <path
                d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
              />
            </svg>
          </button>
          <div class="voice-control-title">
            <h3>Voice Control Interface</h3>
          </div>
          <div class="current-speech-inline" *ngIf="voiceState.isListening">
            <div class="transcript-label-inline">What I'm hearing:</div>
            <div class="transcript-text-inline">
              <span *ngIf="voiceState.currentTranscript"
                >"{{ voiceState.currentTranscript }}"</span
              >
              <span
                *ngIf="!voiceState.currentTranscript"
                class="transcript-waiting"
                >Listening...</span
              >
            </div>
          </div>
        </div>
        <div class="status-text" aria-live="polite" aria-atomic="true">
          {{
            voiceState.isListening
              ? 'Listening...'
              : voiceState.isSupported
              ? 'Click to start voice commands'
              : 'Voice recognition initializing...'
          }}
        </div>
      </div>

      <div
        class="voice-commands-help"
        role="region"
        aria-labelledby="voice-commands-title"
      >
        <h4 id="voice-commands-title">Try saying:</h4>
        <ul role="list" aria-label="Available voice commands">
          <li role="listitem">"Show my health dashboard"</li>
          <li role="listitem">
            "Show my health assessment" or "Risk assessment"
          </li>
          <li role="listitem">"Show my claims" or "Show my vitals"</li>
          <li role="listitem">"Show my goals" or "Show wellness programs"</li>
          <li class="medication-command" role="listitem">
            "Show my medication" or "Show my provider"
          </li>
          <li role="listitem">"Show my benefits" or "Show health insights"</li>
          <li role="listitem">
            "Show appointment schedule" or "Show my care team"
          </li>
          <li role="listitem">"Show fitness goals" or "Show my progress"</li>
          <li role="listitem">
            "Show health trends" or "Show recommendations"
          </li>
          <li role="listitem">"Show my sleep data" or "Show stress levels"</li>
          <li class="stop-command" role="listitem">"Stop" to stop listening</li>
        </ul>
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
      /* Screen reader only text */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .voice-control {
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        color: white;
        text-align: center;
        position: relative;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        display: block;
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
        width: 100%;
      }

      .voice-control-header {
        display: flex;
        align-items: center;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
        position: relative;
      }

      .voice-control-title {
        display: flex;
        align-items: center;
      }

      .voice-control-title h3 {
        margin: 0;
        color: white;
        font-size: 20px;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
        letter-spacing: 0.5px;
      }

      .current-speech-inline {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.25),
          rgba(255, 255, 255, 0.15)
        );
        padding: 8px 12px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        max-width: 200px;
        text-align: left;
        animation: speechPulseInline 2s infinite;
      }

      .transcript-label-inline {
        font-size: 10px;
        opacity: 0.9;
        margin-bottom: 2px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: rgba(255, 255, 255, 0.8);
      }

      .transcript-text-inline {
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        font-style: italic;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .transcript-waiting {
        opacity: 0.7;
        animation: waitingPulse 1.5s infinite;
      }

      @keyframes waitingPulse {
        0%,
        100% {
          opacity: 0.5;
        }
        50% {
          opacity: 1;
        }
      }

      @keyframes speechPulseInline {
        0%,
        100% {
          border-color: rgba(255, 255, 255, 0.3);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.25),
            rgba(255, 255, 255, 0.15)
          );
          box-shadow: 0 0 0 rgba(255, 255, 255, 0.3);
        }
        50% {
          border-color: rgba(255, 255, 255, 0.6);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.35),
            rgba(255, 255, 255, 0.25)
          );
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
        }
      }

      .microphone-icon {
        width: 70px;
        height: 70px;
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.25),
          rgba(255, 255, 255, 0.1)
        );
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(15px);
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .microphone-icon:hover {
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.35),
          rgba(255, 255, 255, 0.2)
        );
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      }

      .voice-status.listening .microphone-icon {
        background: linear-gradient(145deg, #ff6b6b, #ff5252);
        animation: pulse 1.5s infinite;
        box-shadow: 0 0 20px rgba(255, 107, 107, 0.6);
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
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      }

      .voice-commands-help {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.05)
        );
        padding: 20px;
        border-radius: 12px;
        text-align: left;
        margin-bottom: 15px;
        backdrop-filter: blur(10px);
        width: 100%;
        box-sizing: border-box;
        max-height: none;
        overflow: visible;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .voice-commands-help h4 {
        margin: 0 0 15px 0;
        color: #ffd700;
        font-size: 18px;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      }

      .voice-commands-help ul {
        margin: 0;
        padding-left: 20px;
        list-style-type: disc;
      }

      .voice-commands-help li {
        margin-bottom: 8px;
        font-size: 14px;
        line-height: 1.5;
        color: #2c3e50 !important;
        font-weight: 500;
        text-shadow: none;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.95),
          rgba(255, 255, 255, 0.85)
        );
        padding: 8px 12px;
        border-radius: 6px;
        margin: 6px 0;
        transition: all 0.2s ease;
        border-left: 3px solid transparent;
      }

      .voice-commands-help li:hover {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 1),
          rgba(255, 255, 255, 0.95)
        );
        transform: translateX(2px);
        border-left: 3px solid #667eea;
      }

      .stop-command {
        color: #d32f2f !important;
        font-weight: bold !important;
        border-left: 3px solid #d32f2f !important;
        padding-left: 12px !important;
        margin-top: 8px !important;
        background: linear-gradient(
          135deg,
          rgba(255, 235, 238, 0.95),
          rgba(255, 205, 210, 0.9)
        ) !important;
      }

      .medication-command {
        color: #2c3e50 !important;
        font-weight: 500 !important;
        padding: 8px 12px !important;
        margin: 6px 0 !important;
        border-radius: 6px;
        border-left: 3px solid transparent !important;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.95),
          rgba(255, 255, 255, 0.85)
        ) !important;
        transition: all 0.2s ease;
      }

      .medication-command:hover {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 1),
          rgba(255, 255, 255, 0.95)
        ) !important;
        transform: translateX(2px);
        border-left: 3px solid #667eea !important;
      }

      .current-speech {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.2),
          rgba(255, 255, 255, 0.1)
        );
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 15px;
        text-align: center;
        border: 2px dashed rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        animation: speechPulse 2s infinite;
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

      @keyframes speechPulse {
        0%,
        100% {
          border-color: rgba(255, 255, 255, 0.4);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.1)
          );
          box-shadow: 0 0 0 rgba(255, 255, 255, 0.4);
        }
        50% {
          border-color: rgba(255, 255, 255, 0.7);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0.2)
          );
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
      }

      .last-command {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.05)
        );
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 10px;
        text-align: left;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(5px);
      }

      .voice-error {
        background: linear-gradient(
          135deg,
          rgba(255, 100, 100, 0.4),
          rgba(255, 100, 100, 0.2)
        );
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 10px;
        text-align: left;
        border: 1px solid rgba(255, 100, 100, 0.5);
        backdrop-filter: blur(5px);
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

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .voice-control {
          max-width: 90%;
          padding: 15px;
        }

        .voice-control-header {
          flex-direction: column;
          gap: 10px;
        }

        .voice-control-title h3 {
          font-size: 18px;
        }

        .microphone-icon {
          width: 60px;
          height: 60px;
        }

        .voice-commands-help {
          padding: 15px;
        }

        .current-speech-inline {
          max-width: 180px;
          padding: 6px 10px;
        }

        .transcript-text-inline {
          font-size: 11px;
        }
      }

      @media (max-width: 480px) {
        .voice-control {
          max-width: 95%;
          padding: 12px;
        }

        .voice-control-header {
          gap: 8px;
        }

        .voice-control-title h3 {
          font-size: 16px;
        }

        .microphone-icon {
          width: 50px;
          height: 50px;
        }

        .voice-commands-help li {
          font-size: 13px;
          padding: 6px 10px;
        }

        .current-speech-inline {
          max-width: 150px;
          padding: 5px 8px;
        }

        .transcript-label-inline {
          font-size: 9px;
        }

        .transcript-text-inline {
          font-size: 10px;
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

  constructor(
    private voiceService: VoiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.voiceService.voiceState$.subscribe((state) => {
        // Debug logging for UI state changes
        if (state.isListening !== this.voiceState.isListening) {
          console.log(
            '🖥️ UI State Update - isListening:',
            this.voiceState.isListening,
            '->',
            state.isListening
          );
        }

        // Debug logging for transcript changes
        if (state.currentTranscript !== this.voiceState.currentTranscript) {
          console.log(
            '🎤 Transcript Update:',
            this.voiceState.currentTranscript,
            '->',
            state.currentTranscript
          );
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
