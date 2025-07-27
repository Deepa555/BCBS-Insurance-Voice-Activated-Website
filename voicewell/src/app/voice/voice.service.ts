import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: Date;
}

export interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  lastCommand: VoiceCommand | null;
  error: string | null;
  currentTranscript: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class VoiceService {
  private recognition: any;
  private speechSynthesis: SpeechSynthesis | null = null;
  private isBrowser: boolean;
  private shouldKeepListening = false; // Flag to control auto-restart
  private hasGivenWelcome = false; // Flag to prevent repeating welcome message
  private voiceStateSubject = new BehaviorSubject<VoiceState>({
    isListening: false,
    isSupported: false,
    lastCommand: null,
    error: null,
    currentTranscript: null,
  });

  public voiceState$ = this.voiceStateSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Initialize after constructor to ensure proper platform detection
    setTimeout(() => {
      this.initializeVoiceService();
    }, 0);
  }

  private initializeVoiceService(): void {
    const isSupported = this.isSpeechRecognitionSupported();
    this.updateState({ isSupported });

    if (isSupported) {
      this.initializeSpeechRecognition();
    }

    // Initialize text-to-speech if available
    if (this.isBrowser && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  private isSpeechRecognitionSupported(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  private initializeSpeechRecognition(): void {
    if (!this.isBrowser || !this.isSpeechRecognitionSupported()) {
      this.updateState({
        error: 'Speech recognition not supported in this browser',
      });
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = false; // Don't continue listening automatically
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.updateState({ isListening: true, error: null });
    };

    this.recognition.onend = () => {
      console.log(
        '🔚 Recognition ended. shouldKeepListening:',
        this.shouldKeepListening
      );
      
      // ALWAYS update state to show we're not listening when recognition ends
      // This ensures the animation stops regardless of any other conditions
      this.updateState({
        isListening: false,
        currentTranscript: null, // Clear transcript when listening ends
      });
      
      // Force another state update to ensure UI synchronization
      setTimeout(() => {
        this.updateState({
          isListening: false,
          currentTranscript: null,
        });
      }, 50);

      // Auto-restart only if we should keep listening and there's no error
      if (this.shouldKeepListening && !this.voiceStateSubject.value.error) {
        console.log('🔄 Recognition ended, restarting in 500ms...');
        setTimeout(() => {
          if (this.shouldKeepListening) {
            console.log('🔄 Auto-restarting recognition');
            this.startListening();
          } else {
            console.log('🛑 shouldKeepListening is false, not restarting');
          }
        }, 500); // Small delay before restarting
      } else {
        console.log(
          '🛑 Not restarting - shouldKeepListening:',
          this.shouldKeepListening,
          'error:',
          this.voiceStateSubject.value.error
        );
        
        // Ensure UI shows we're not listening
        this.updateState({
          isListening: false,
          currentTranscript: null,
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      this.updateState({
        isListening: false,
        error: `Speech recognition error: ${event.error}`,
        currentTranscript: null, // Clear transcript on error
      });
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          const command: VoiceCommand = {
            command: transcript.trim(),
            confidence: event.results[i][0].confidence,
            timestamp: new Date(),
          };
          this.updateState({
            lastCommand: command,
            currentTranscript: null, // Clear interim transcript when final
          });
          this.processVoiceCommand(command);
        } else {
          interimTranscript += transcript;
        }
      }

      // Update current transcript with interim results for real-time display
      if (interimTranscript) {
        this.updateState({
          currentTranscript: interimTranscript.trim(),
        });
      }
    };
  }

  startListening(): void {
    if (!this.isBrowser) {
      this.updateState({ error: 'Voice recognition not available on server' });
      return;
    }

    this.shouldKeepListening = true; // Set flag to allow continuous listening

    if (this.recognition && !this.voiceStateSubject.value.isListening) {
      try {
        this.recognition.start();
        // Brief welcome message - only on first start
        if (!this.hasGivenWelcome) {
          setTimeout(() => {
            if (this.voiceStateSubject.value.isListening) {
              this.speakResponse('Hello Welcome to AZ Blue Voice');
              this.hasGivenWelcome = true;
            }
          }, 500);
        }
      } catch (error) {
        this.updateState({
          error: `Failed to start voice recognition: ${error}`,
        });
      }
    }
  }

  stopListening(): void {
    if (!this.isBrowser) {
      return;
    }

    console.log('🛑 stopListening() called - setting shouldKeepListening to false');
    
    // IMMEDIATELY update state first before anything else
    this.shouldKeepListening = false; // Clear flag to stop auto-restart
    this.hasGivenWelcome = false; // Reset welcome flag for next session
    
    // Force update state immediately to show we're not listening
    this.updateState({
      isListening: false,
      currentTranscript: null,
    });

    console.log('🛑 State updated - isListening set to false');

    // Then try to stop the actual recognition
    if (this.recognition) {
      try {
        console.log('🛑 Stopping Web Speech API recognition');
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        this.updateState({
          error: `Failed to stop voice recognition: ${error}`,
        });
      }
    }
    
    console.log('🛑 stopListening() completed');
  }

  private updateState(updates: Partial<VoiceState>): void {
    const currentState = this.voiceStateSubject.value;
    const newState = { ...currentState, ...updates };
    
    // Debug logging for state changes
    if (updates.isListening !== undefined) {
      console.log('🔄 State Update - isListening:', currentState.isListening, '->', updates.isListening);
    }
    
    this.voiceStateSubject.next(newState);
  }

  private speakResponse(message: string): void {
    if (!this.isBrowser || !this.speechSynthesis) {
      console.log('🗣️ Voice response:', message);
      return;
    }

    try {
      // Cancel any existing speech
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(message);

      // Configure voice settings
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 0.8; // Slightly quieter

      // Try to use a pleasant voice
      const voices = this.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes('Google') ||
          voice.name.includes('Microsoft') ||
          voice.name.includes('Samantha') ||
          voice.lang.startsWith('en')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      console.log('🗣️ Speaking:', message);
      this.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      console.log('🗣️ Voice response:', message);
    }
  }

  private processVoiceCommand(command: VoiceCommand): void {
    console.log('Processing voice command:', command);

    // Check if the command is a "stop" command first
    const lowerCommand = command.command.toLowerCase().trim();
    if (
      lowerCommand.includes('stop') ||
      lowerCommand.includes('stop listening') ||
      lowerCommand.includes("that's all")
    ) {
      console.log('🛑 Stop command detected - will stop listening');
      this.stopListening();
      return;
    }

    // Process other commands and stop listening after successful command
    if (this.parseHealthCommand(command.command)) {
      console.log('✅ Command processed successfully - stopping listening immediately');
      
      // IMMEDIATELY force multiple state updates to ensure UI synchronization
      this.updateState({
        isListening: false,
        currentTranscript: null,
      });
      
      // Force another state update after a brief delay to ensure detection
      setTimeout(() => {
        this.updateState({
          isListening: false,
          currentTranscript: null,
        });
      }, 10);
      
      console.log('🛑 Setting shouldKeepListening to false to prevent auto-restart');
      this.shouldKeepListening = false;
      
      // Stop listening after state is updated
      this.stopListening();
      
      console.log('🛑 Voice recognition should now be stopped');
      return; // Ensure we exit here
    } else {
      console.log('❌ Command not recognized:', command.command);
      const response =
        "Sorry, I didn't understand that command. Please try again.";

      // Update state to show unrecognized command
      this.updateState({
        lastCommand: {
          command: `Unrecognized: "${command.command}"`,
          confidence: command.confidence,
          timestamp: new Date(),
        },
      });

      // Speak the response
      this.speakResponse(response);

      // Continue listening for unrecognized commands
    }
  }

  private parseHealthCommand(command: string): boolean {
    const lowerCommand = command.toLowerCase().trim();
    console.log('🔍 Parsing command:', `"${lowerCommand}"`);

    // Health dashboard commands - improved matching
    if (
      (lowerCommand.includes('show') &&
        (lowerCommand.includes('health') ||
          lowerCommand.includes('dashboard'))) ||
      (lowerCommand.includes('health') && lowerCommand.includes('dashboard')) ||
      lowerCommand.includes('health dashboard') ||
      (lowerCommand.includes('my') && lowerCommand.includes('health')) ||
      lowerCommand.includes('dashboard')
    ) {
      console.log(
        '✅ Health dashboard command recognized - will stop listening'
      );
      this.triggerHealthDashboard();
      return true;
    }

    // Risk/Health assessment commands
    if (
      (lowerCommand.includes('risk') && lowerCommand.includes('assessment')) ||
      (lowerCommand.includes('health') &&
        lowerCommand.includes('assessment')) ||
      (lowerCommand.includes('show') && lowerCommand.includes('assessment')) ||
      lowerCommand.includes('risk assessment')
    ) {
      this.triggerRiskAssessment();
      return true;
    }

    // Claims commands
    if (
      lowerCommand.includes('claims') ||
      lowerCommand.includes('claim') ||
      (lowerCommand.includes('my') &&
        (lowerCommand.includes('claims') || lowerCommand.includes('claim'))) ||
      (lowerCommand.includes('show') &&
        (lowerCommand.includes('claims') || lowerCommand.includes('claim')))
    ) {
      console.log('✅ Claims command recognized');
      this.triggerClaimsView();
      return true;
    }

    // Vitals commands - handle both singular and plural
    if (
      lowerCommand.includes('vitals') ||
      lowerCommand.includes('vital') ||
      lowerCommand.includes('vital signs') ||
      (lowerCommand.includes('show') &&
        (lowerCommand.includes('vitals') || lowerCommand.includes('vital'))) ||
      (lowerCommand.includes('my') &&
        (lowerCommand.includes('vitals') || lowerCommand.includes('vital')))
    ) {
      console.log('✅ Vitals command recognized');
      this.triggerVitalsView();
      return true;
    }

    // Health prediction commands
    if (
      (lowerCommand.includes('predict') && lowerCommand.includes('health')) ||
      (lowerCommand.includes('health') && lowerCommand.includes('prediction'))
    ) {
      this.triggerHealthPrediction();
      return true;
    }

    // Goals commands
    if (
      lowerCommand.includes('goals') ||
      lowerCommand.includes('goal') ||
      lowerCommand.includes('health goals') ||
      lowerCommand.includes('health goal') ||
      (lowerCommand.includes('show') &&
        (lowerCommand.includes('goals') || lowerCommand.includes('goal'))) ||
      (lowerCommand.includes('my') &&
        (lowerCommand.includes('goals') || lowerCommand.includes('goal')))
    ) {
      console.log('✅ Goals command recognized');
      this.triggerGoalsView();
      return true;
    }

    // Wellness programs commands
    if (
      lowerCommand.includes('wellness') ||
      lowerCommand.includes('programs') ||
      lowerCommand.includes('program') ||
      (lowerCommand.includes('wellness') &&
        (lowerCommand.includes('programs') ||
          lowerCommand.includes('program'))) ||
      (lowerCommand.includes('show') && lowerCommand.includes('wellness')) ||
      (lowerCommand.includes('my') && lowerCommand.includes('wellness'))
    ) {
      console.log('✅ Wellness command recognized');
      this.triggerWellnessView();
      return true;
    }

    // Medication commands
    if (
      lowerCommand.includes('medication') ||
      lowerCommand.includes('medications') ||
      lowerCommand.includes('medicines') ||
      lowerCommand.includes('medicine') ||
      lowerCommand.includes('pills') ||
      lowerCommand.includes('pill') ||
      (lowerCommand.includes('show') &&
        (lowerCommand.includes('medication') ||
          lowerCommand.includes('medicine'))) ||
      (lowerCommand.includes('my') &&
        (lowerCommand.includes('medication') ||
          lowerCommand.includes('medicine')))
    ) {
      console.log('✅ Medication command recognized');
      this.triggerMedicationView();
      return true;
    }

    // Provider/Care team commands
    if (
      lowerCommand.includes('provider') ||
      lowerCommand.includes('providers') ||
      lowerCommand.includes('doctor') ||
      lowerCommand.includes('doctors') ||
      lowerCommand.includes('care team') ||
      lowerCommand.includes('physician') ||
      (lowerCommand.includes('show') &&
        (lowerCommand.includes('provider') ||
          lowerCommand.includes('doctor'))) ||
      (lowerCommand.includes('my') &&
        (lowerCommand.includes('provider') || lowerCommand.includes('doctor')))
    ) {
      console.log('✅ Provider command recognized');
      this.triggerProviderView();
      return true;
    }

    // Benefits commands
    if (
      lowerCommand.includes('benefits') ||
      lowerCommand.includes('benefit') ||
      lowerCommand.includes('coverage') ||
      lowerCommand.includes('insurance') ||
      (lowerCommand.includes('show') &&
        (lowerCommand.includes('benefits') ||
          lowerCommand.includes('coverage'))) ||
      (lowerCommand.includes('my') &&
        (lowerCommand.includes('benefits') ||
          lowerCommand.includes('coverage')))
    ) {
      console.log('✅ Benefits command recognized');
      this.triggerBenefitsView();
      return true;
    }

    // Insights commands
    if (
      lowerCommand.includes('insights') ||
      lowerCommand.includes('insight') ||
      lowerCommand.includes('trends') ||
      lowerCommand.includes('trend') ||
      (lowerCommand.includes('health') &&
        (lowerCommand.includes('insights') ||
          lowerCommand.includes('trends'))) ||
      (lowerCommand.includes('show') &&
        (lowerCommand.includes('insights') ||
          lowerCommand.includes('trends'))) ||
      (lowerCommand.includes('my') &&
        (lowerCommand.includes('insights') || lowerCommand.includes('trends')))
    ) {
      console.log('✅ Insights command recognized');
      this.triggerInsightsView();
      return true;
    }

    // Stop listening command
    if (
      lowerCommand.includes('stop') ||
      lowerCommand.includes('stop listening') ||
      lowerCommand.includes("that's all")
    ) {
      this.stopListening();
      return true;
    }

    // Back to top commands
    if (
      lowerCommand.includes('go to top') ||
      lowerCommand.includes('back to top') ||
      lowerCommand.includes('scroll to top') ||
      lowerCommand.includes('go back to top') ||
      lowerCommand.includes('top of page')
    ) {
      this.triggerBackToTop();
      return true;
    }

    // Appointment/Schedule commands
    if (
      lowerCommand.includes('appointment') ||
      lowerCommand.includes('schedule') ||
      lowerCommand.includes('care team') ||
      (lowerCommand.includes('show') && lowerCommand.includes('appointment')) ||
      (lowerCommand.includes('my') && lowerCommand.includes('appointments'))
    ) {
      console.log('✅ Appointment/Care team command recognized');
      this.triggerCareTeamView();
      return true;
    }

    // Fitness/Progress commands
    if (
      lowerCommand.includes('fitness') ||
      lowerCommand.includes('progress') ||
      lowerCommand.includes('fitness goals') ||
      lowerCommand.includes('exercise') ||
      (lowerCommand.includes('show') && lowerCommand.includes('fitness')) ||
      (lowerCommand.includes('my') && lowerCommand.includes('progress'))
    ) {
      console.log('✅ Fitness/Progress command recognized');
      this.triggerFitnessView();
      return true;
    }

    // Health trends/analytics commands
    if (
      lowerCommand.includes('trends') ||
      lowerCommand.includes('analytics') ||
      lowerCommand.includes('health trends') ||
      lowerCommand.includes('data analysis') ||
      (lowerCommand.includes('show') && lowerCommand.includes('trends'))
    ) {
      console.log('✅ Health trends command recognized');
      this.triggerTrendsView();
      return true;
    }

    // Sleep data commands
    if (
      lowerCommand.includes('sleep') ||
      lowerCommand.includes('sleep data') ||
      lowerCommand.includes('sleep quality') ||
      (lowerCommand.includes('show') && lowerCommand.includes('sleep')) ||
      (lowerCommand.includes('my') && lowerCommand.includes('sleep'))
    ) {
      console.log('✅ Sleep data command recognized');
      this.triggerSleepView();
      return true;
    }

    // Stress level commands
    if (
      lowerCommand.includes('stress') ||
      lowerCommand.includes('stress level') ||
      lowerCommand.includes('stress levels') ||
      (lowerCommand.includes('show') && lowerCommand.includes('stress')) ||
      (lowerCommand.includes('my') && lowerCommand.includes('stress'))
    ) {
      console.log('✅ Stress level command recognized');
      this.triggerStressView();
      return true;
    }

    console.log('Command not recognized as health-related:', lowerCommand);
    return false;
  }

  private triggerHealthDashboard(): void {
    console.log('Triggering health dashboard view');
    const response = 'Opening your health dashboard';

    this.updateState({
      lastCommand: {
        command: 'Health dashboard activated',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    // Speak the response
    this.speakResponse(response);

    // Scroll to dashboard section
    if (this.isBrowser) {
      setTimeout(() => {
        const dashboardElement = document.querySelector('.dashboard-section');
        if (dashboardElement) {
          dashboardElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }

  private triggerRiskAssessment(): void {
    console.log('Triggering risk assessment');
    const response = 'Showing your health risk assessment';

    this.updateState({
      lastCommand: {
        command: 'Risk assessment displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    // Speak the response
    this.speakResponse(response);

    // Scroll to risk assessment card
    if (this.isBrowser) {
      setTimeout(() => {
        const riskElement = document.querySelector('.risk-assessment');
        if (riskElement) {
          riskElement.scrollIntoView({ behavior: 'smooth' });
          // Add a highlight effect
          riskElement.classList.add('highlighted');
          setTimeout(() => {
            riskElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerClaimsView(): void {
    console.log('Triggering claims view');
    const response = 'Opening your claims information';

    this.updateState({
      lastCommand: {
        command: 'Claims information displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    // Speak the response
    this.speakResponse(response);

    // Scroll to claims card
    if (this.isBrowser) {
      setTimeout(() => {
        const claimsElement = document.querySelector('.claims');
        if (claimsElement) {
          claimsElement.scrollIntoView({ behavior: 'smooth' });
          claimsElement.classList.add('highlighted');
          setTimeout(() => {
            claimsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerVitalsView(): void {
    console.log('Triggering vitals view');
    const response = 'Displaying your vital signs';

    this.updateState({
      lastCommand: {
        command: 'Vital signs displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    // Speak the response
    this.speakResponse(response);

    // Scroll to vitals card
    if (this.isBrowser) {
      setTimeout(() => {
        const vitalsElement = document.querySelector('.vitals');
        if (vitalsElement) {
          vitalsElement.scrollIntoView({ behavior: 'smooth' });
          vitalsElement.classList.add('highlighted');
          setTimeout(() => {
            vitalsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerHealthPrediction(): void {
    console.log('Triggering health prediction');
    this.updateState({
      lastCommand: {
        command: 'Health prediction analysis complete',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    // Scroll to recommendations
    if (this.isBrowser) {
      setTimeout(() => {
        const recommendationsElement =
          document.querySelector('.recommendations');
        if (recommendationsElement) {
          recommendationsElement.scrollIntoView({ behavior: 'smooth' });
          recommendationsElement.classList.add('highlighted');
          setTimeout(() => {
            recommendationsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerGoalsView(): void {
    console.log('Triggering goals view');
    const response = 'Showing your health goals';

    this.updateState({
      lastCommand: {
        command: 'Health goals displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    // Speak the response
    this.speakResponse(response);

    if (this.isBrowser) {
      setTimeout(() => {
        const goalsElement = document.querySelector('.goals-card');
        if (goalsElement) {
          goalsElement.scrollIntoView({ behavior: 'smooth' });
          goalsElement.classList.add('highlighted');
          setTimeout(() => {
            goalsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerWellnessView(): void {
    console.log('Triggering wellness programs view');
    const response = 'Opening your wellness programs';

    this.updateState({
      lastCommand: {
        command: 'Wellness programs displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    if (this.isBrowser) {
      setTimeout(() => {
        const wellnessElement = document.querySelector('.wellness-card');
        if (wellnessElement) {
          wellnessElement.scrollIntoView({ behavior: 'smooth' });
          wellnessElement.classList.add('highlighted');
          setTimeout(() => {
            wellnessElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerMedicationView(): void {
    console.log('Triggering medication tracker view');
    this.updateState({
      lastCommand: {
        command: 'Medication tracker displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    if (this.isBrowser) {
      setTimeout(() => {
        const medicationElement = document.querySelector('.medication-card');
        if (medicationElement) {
          medicationElement.scrollIntoView({ behavior: 'smooth' });
          medicationElement.classList.add('highlighted');
          setTimeout(() => {
            medicationElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerProviderView(): void {
    console.log('Triggering provider/care team view');
    this.updateState({
      lastCommand: {
        command: 'Care team information displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    if (this.isBrowser) {
      setTimeout(() => {
        const providerElement = document.querySelector('.provider-card');
        if (providerElement) {
          providerElement.scrollIntoView({ behavior: 'smooth' });
          providerElement.classList.add('highlighted');
          setTimeout(() => {
            providerElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerBenefitsView(): void {
    console.log('Triggering benefits summary view');
    this.updateState({
      lastCommand: {
        command: 'Benefits summary displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    if (this.isBrowser) {
      setTimeout(() => {
        const benefitsElement = document.querySelector('.benefits-card');
        if (benefitsElement) {
          benefitsElement.scrollIntoView({ behavior: 'smooth' });
          benefitsElement.classList.add('highlighted');
          setTimeout(() => {
            benefitsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerInsightsView(): void {
    console.log('Triggering health insights view');
    this.updateState({
      lastCommand: {
        command: 'Health insights displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    if (this.isBrowser) {
      setTimeout(() => {
        const insightsElement = document.querySelector('.insights-card');
        if (insightsElement) {
          insightsElement.scrollIntoView({ behavior: 'smooth' });
          insightsElement.classList.add('highlighted');
          setTimeout(() => {
            insightsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerBackToTop(): void {
    console.log('Triggering back to top');
    const response = 'Scrolling to the top of the page';
    
    this.updateState({
      lastCommand: {
        command: 'Scrolled to top of page',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    this.speakResponse(response);

    if (this.isBrowser) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 500);
    }
  }

  private triggerCareTeamView(): void {
    console.log('Triggering care team view');
    const response = 'Showing your care team and appointment schedule';
    
    this.updateState({
      lastCommand: {
        command: 'Care team information displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    this.speakResponse(response);

    if (this.isBrowser) {
      setTimeout(() => {
        const careTeamElement = document.querySelector('.provider-card');
        if (careTeamElement) {
          careTeamElement.scrollIntoView({ behavior: 'smooth' });
          careTeamElement.classList.add('highlighted');
          setTimeout(() => {
            careTeamElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerFitnessView(): void {
    console.log('Triggering fitness goals view');
    const response = 'Displaying your fitness goals and progress';
    
    this.updateState({
      lastCommand: {
        command: 'Fitness goals displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    this.speakResponse(response);

    if (this.isBrowser) {
      setTimeout(() => {
        const goalsElement = document.querySelector('.goals-card');
        if (goalsElement) {
          goalsElement.scrollIntoView({ behavior: 'smooth' });
          goalsElement.classList.add('highlighted');
          setTimeout(() => {
            goalsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerTrendsView(): void {
    console.log('Triggering health trends view');
    const response = 'Showing your health trends and analytics';
    
    this.updateState({
      lastCommand: {
        command: 'Health trends displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    this.speakResponse(response);

    if (this.isBrowser) {
      setTimeout(() => {
        const insightsElement = document.querySelector('.insights-card');
        if (insightsElement) {
          insightsElement.scrollIntoView({ behavior: 'smooth' });
          insightsElement.classList.add('highlighted');
          setTimeout(() => {
            insightsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerSleepView(): void {
    console.log('Triggering sleep data view');
    const response = 'Displaying your sleep data and quality metrics';
    
    this.updateState({
      lastCommand: {
        command: 'Sleep data displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    this.speakResponse(response);

    if (this.isBrowser) {
      setTimeout(() => {
        const vitalsElement = document.querySelector('.vitals');
        if (vitalsElement) {
          vitalsElement.scrollIntoView({ behavior: 'smooth' });
          vitalsElement.classList.add('highlighted');
          setTimeout(() => {
            vitalsElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }

  private triggerStressView(): void {
    console.log('Triggering stress levels view');
    const response = 'Showing your stress levels and management programs';
    
    this.updateState({
      lastCommand: {
        command: 'Stress levels displayed',
        confidence: 1.0,
        timestamp: new Date(),
      },
    });

    this.speakResponse(response);

    if (this.isBrowser) {
      setTimeout(() => {
        const wellnessElement = document.querySelector('.wellness-card');
        if (wellnessElement) {
          wellnessElement.scrollIntoView({ behavior: 'smooth' });
          wellnessElement.classList.add('highlighted');
          setTimeout(() => {
            wellnessElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }
}
