import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PopupData {
  show: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  claimsData?: any;
  vitalsData?: any;
  medicationData?: any;
  goalData?: any;
  benefitsData?: any;
  isClaimsPopup?: boolean;
  isVitalsPopup?: boolean;
  isMedicationPopup?: boolean;
  isGoalsPopup?: boolean;
  isBenefitsPopup?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private popupSubject = new BehaviorSubject<PopupData>({
    show: false,
    title: '',
    message: '',
    type: 'info',
    claimsData: null,
    vitalsData: null,
    medicationData: null,
    goalData: null,
    benefitsData: null,
    isClaimsPopup: false,
    isVitalsPopup: false,
    isMedicationPopup: false,
    isGoalsPopup: false,
    isBenefitsPopup: false,
  });

  public popup$ = this.popupSubject.asObservable();

  showPopup(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): void {
    this.popupSubject.next({
      show: true,
      title,
      message,
      type,
      claimsData: null,
      vitalsData: null,
      medicationData: null,
      goalData: null,
      benefitsData: null,
      isClaimsPopup: false,
      isVitalsPopup: false,
      isMedicationPopup: false,
      isGoalsPopup: false,
      isBenefitsPopup: false,
    });
  }

  showVitalsPopup(vitalsData: any): void {
    console.log('🎯 PopupService.showVitalsPopup called with data:', vitalsData);
    console.log('📋 Vitals data structure check:', {
      hasHeartRate: vitalsData?.heartRate !== undefined,
      hasBloodPressure: vitalsData?.bloodPressure !== undefined,
      hasBloodSugar: vitalsData?.bloodSugar !== undefined,
      hasBMI: vitalsData?.bmi !== undefined,
      fullData: vitalsData
    });
    
    this.popupSubject.next({
      show: true,
      title: '📊 Vital Signs',
      message: 'Your current health metrics and vital signs',
      type: 'info',
      claimsData: null,
      vitalsData: vitalsData,
      medicationData: null,
      goalData: null,
      benefitsData: null,
      isClaimsPopup: false,
      isVitalsPopup: true,
      isMedicationPopup: false,
      isGoalsPopup: false,
      isBenefitsPopup: false,
    });
    
    console.log('✅ Popup data sent to subscribers');
    this.scheduleAutoHide();
  }

  showMedicationPopup(medicationData: any): void {
    this.popupSubject.next({
      show: true,
      title: '💊 Medications',
      message: 'Your current medication schedule and adherence',
      type: 'info',
      claimsData: null,
      vitalsData: null,
      medicationData: medicationData,
      goalData: null,
      benefitsData: null,
      isClaimsPopup: false,
      isVitalsPopup: false,
      isMedicationPopup: true,
      isGoalsPopup: false,
      isBenefitsPopup: false,
    });
    this.scheduleAutoHide();
  }

  showGoalsPopup(goalData: any): void {
    this.popupSubject.next({
      show: true,
      title: '🎯 Health Goals',
      message: 'Your health goals and progress tracking',
      type: 'info',
      claimsData: null,
      vitalsData: null,
      medicationData: null,
      goalData: goalData,
      benefitsData: null,
      isClaimsPopup: false,
      isVitalsPopup: false,
      isMedicationPopup: false,
      isGoalsPopup: true,
      isBenefitsPopup: false,
    });
    this.scheduleAutoHide();
  }

  showBenefitsPopup(benefitsData: any): void {
    this.popupSubject.next({
      show: true,
      title: '🏥 Benefits Summary',
      message: 'Your insurance benefits and coverage details',
      type: 'info',
      claimsData: null,
      vitalsData: null,
      medicationData: null,
      goalData: null,
      benefitsData: benefitsData,
      isClaimsPopup: false,
      isVitalsPopup: false,
      isMedicationPopup: false,
      isGoalsPopup: false,
      isBenefitsPopup: true,
    });
    this.scheduleAutoHide();
  }

  showClaimsPopup(claimsData: any): void {
    this.popupSubject.next({
      show: true,
      title: '📋 Recent Claims',
      message: 'Your recent insurance claims and status',
      type: 'info',
      claimsData: claimsData,
      vitalsData: null,
      medicationData: null,
      goalData: null,
      benefitsData: null,
      isClaimsPopup: true,
      isVitalsPopup: false,
      isMedicationPopup: false,
      isGoalsPopup: false,
      isBenefitsPopup: false,
    });
    this.scheduleAutoHide();
  }

  private scheduleAutoHide(): void {
    // Auto-hide after 5 seconds with fade-out animation
    setTimeout(() => {
      // Add fade-out class first
      const popupOverlay = document.querySelector('.popup-overlay');
      if (popupOverlay) {
        popupOverlay.classList.add('fade-out');
        // Wait for animation to complete, then hide
        setTimeout(() => {
          this.hidePopup();
        }, 400); // 0.4s animation duration
      } else {
        this.hidePopup();
      }
    }, 4600); // Start fade at 4.6s to complete at 5s
  }

  hidePopup(): void {
    this.popupSubject.next({
      show: false,
      title: '',
      message: '',
      type: 'info',
      claimsData: null,
      vitalsData: null,
      medicationData: null,
      goalData: null,
      benefitsData: null,
      isClaimsPopup: false,
      isVitalsPopup: false,
      isMedicationPopup: false,
      isGoalsPopup: false,
      isBenefitsPopup: false,
    });
  }
}
