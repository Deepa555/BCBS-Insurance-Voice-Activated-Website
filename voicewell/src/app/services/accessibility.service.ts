import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AccessibilityService {
  private speechSynthesis: SpeechSynthesis | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  /**
   * Announces text to screen readers using aria-live regions
   */
  announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    if (!this.isBrowser) return;

    // Create or update aria-live announcement region
    let announcer = document.getElementById('aria-live-announcer');

    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'aria-live-announcer';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    } else {
      announcer.setAttribute('aria-live', priority);
    }

    // Clear and set new message
    announcer.textContent = '';
    setTimeout(() => {
      announcer!.textContent = message;
    }, 100);
  }

  /**
   * Speaks text using Text-to-Speech API
   */
  speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voice?: string;
    } = {}
  ): void {
    if (!this.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    if (options.voice) {
      const voices = this.speechSynthesis.getVoices();
      const selectedVoice = voices.find(
        (voice) => voice.name === options.voice
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    this.speechSynthesis.speak(utterance);
  }

  /**
   * Stops any ongoing speech
   */
  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Gets available voices for text-to-speech
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynthesis) return [];
    return this.speechSynthesis.getVoices();
  }

  /**
   * Sets focus to an element with proper announcement
   */
  setFocusWithAnnouncement(elementId: string, announcement?: string): void {
    if (!this.isBrowser) return;

    const element = document.getElementById(elementId);
    if (element) {
      element.focus();

      if (announcement) {
        this.announceToScreenReader(announcement);
      }
    }
  }

  /**
   * Enhances keyboard navigation by adding proper focus indicators
   */
  enhanceKeyboardNavigation(): void {
    if (!this.isBrowser) return;

    // Add visible focus indicators for keyboard users
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-user *:focus {
        outline: 3px solid #4A90E2 !important;
        outline-offset: 2px !important;
      }
      
      .keyboard-user button:focus,
      .keyboard-user a:focus {
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.5) !important;
      }
    `;
    document.head.appendChild(style);

    // Detect keyboard usage
    let isKeyboardUser = false;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !isKeyboardUser) {
        isKeyboardUser = true;
        document.body.classList.add('keyboard-user');
      }
    });

    document.addEventListener('mousedown', () => {
      if (isKeyboardUser) {
        isKeyboardUser = false;
        document.body.classList.remove('keyboard-user');
      }
    });
  }

  /**
   * Announces popup content for screen readers
   */
  announcePopupContent(title: string, content: string): void {
    const announcement = `${title}. ${content}. Dialog opened. Press Escape to close.`;
    this.announceToScreenReader(announcement, 'assertive');
  }

  /**
   * Announces when popup is closed
   */
  announcePopupClosed(): void {
    this.announceToScreenReader('Dialog closed.', 'polite');
  }

  /**
   * Announces voice command results
   */
  announceVoiceCommandResult(command: string, result: string): void {
    const announcement = `Voice command "${command}" executed. ${result}`;
    this.announceToScreenReader(announcement, 'polite');
  }

  /**
   * Gets alternative text for health data visualization
   */
  getHealthDataAltText(data: any, type: string): string {
    switch (type) {
      case 'vitals':
        return `Health vitals: Heart rate ${data.heartRate} beats per minute, Blood pressure ${data.bloodPressure.systolic} over ${data.bloodPressure.diastolic}, Blood sugar ${data.bloodSugar} mg/dL, BMI ${data.bmi}`;

      case 'claims':
        const claimsCount = data.length;
        const totalAmount = data.reduce(
          (sum: number, claim: any) => sum + claim.amount,
          0
        );
        return `${claimsCount} recent claims totaling $${totalAmount}`;

      case 'goals':
        const goalsCount = data.length;
        const completedGoals = data.filter(
          (goal: any) => goal.current / goal.targetValue >= 1
        ).length;
        return `${goalsCount} health goals, ${completedGoals} completed`;

      case 'medications':
        const medCount = data.length;
        const avgAdherence =
          data.reduce((sum: number, med: any) => sum + med.adherence, 0) /
          medCount;
        return `${medCount} medications with average adherence of ${Math.round(
          avgAdherence
        )}%`;

      default:
        return 'Health data visualization';
    }
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibility(): void {
    if (!this.isBrowser) return;

    this.enhanceKeyboardNavigation();

    // Add skip links for keyboard navigation
    this.addSkipLinks();

    // Ensure all images have alt text
    this.validateImageAltText();

    // Add keyboard shortcuts info
    this.addKeyboardShortcutsInfo();
  }

  private addSkipLinks(): void {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#voice-control" class="skip-link">Skip to voice control</a>
      <a href="#dashboard" class="skip-link">Skip to dashboard</a>
    `;

    const skipLinksStyle = document.createElement('style');
    skipLinksStyle.textContent = `
      .skip-links {
        position: absolute;
        top: -50px;
        left: 0;
        z-index: 10001;
      }
      
      .skip-link {
        position: absolute;
        top: -50px;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 0 0 4px 0;
        z-index: 10002;
      }
      
      .skip-link:focus {
        top: 0;
      }
    `;

    document.head.appendChild(skipLinksStyle);
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  private validateImageAltText(): void {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        console.warn('Image missing alt text:', img.src);
      }
    });
  }

  private addKeyboardShortcutsInfo(): void {
    // Add keyboard shortcuts information accessible via screen readers
    const shortcutsInfo = document.createElement('div');
    shortcutsInfo.id = 'keyboard-shortcuts-info';
    shortcutsInfo.setAttribute('aria-hidden', 'true');
    shortcutsInfo.style.display = 'none';
    shortcutsInfo.textContent = `
      Keyboard shortcuts: Tab to navigate, Enter or Space to activate buttons, 
      Escape to close dialogs, Arrow keys to navigate within lists and grids
    `;
    document.body.appendChild(shortcutsInfo);
  }
}
