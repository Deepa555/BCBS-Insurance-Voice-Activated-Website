import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AnalyticsService, HealthData } from '../analytics/analytics.service';
import { PopupService } from '../services/popup.service';

@Component({
  selector: 'app-health-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Voice Command Popup Modal -->
    <div
      class="popup-overlay"
      *ngIf="showPopup"
      (click)="hidePopup()"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'popup-title'"
      [attr.aria-describedby]="'popup-content'"
    >
      <div
        class="popup-modal"
        [class]="'popup-' + popupType"
        (click)="$event.stopPropagation()"
      >
        <!-- Standard Popup -->
        <div
          *ngIf="
            !isClaimsPopup &&
            !isVitalsPopup &&
            !isMedicationPopup &&
            !isGoalsPopup &&
            !isBenefitsPopup
          "
        >
          <div class="popup-header">
            <h3 id="popup-title">{{ popupTitle }}</h3>
            <button
              class="popup-close"
              (click)="hidePopup()"
              type="button"
              aria-label="Close popup"
            >
              &times;
            </button>
          </div>
          <div class="popup-content" id="popup-content">
            <p role="text">{{ popupMessage }}</p>
          </div>
          <div class="popup-footer">
            <button
              class="popup-button"
              (click)="hidePopup()"
              type="button"
              aria-label="Close popup"
            >
              OK
            </button>
          </div>
        </div>

        <!-- Claims Popup -->
        <div *ngIf="isClaimsPopup && claimsData" class="claims-popup">
          <div class="popup-header">
            <h3 id="popup-title">{{ popupTitle }}</h3>
            <button
              class="popup-close"
              (click)="hidePopup()"
              type="button"
              aria-label="Close claims popup"
            >
              &times;
            </button>
          </div>
          <div class="popup-content claims-content" id="popup-content">
            <div
              class="claims-popup-list"
              role="list"
              aria-label="Recent insurance claims"
            >
              <div
                class="claim-popup-item"
                *ngFor="let claim of claimsData.slice(0, 4)"
                role="listitem"
                [attr.aria-label]="
                  'Claim: ' +
                  claim.description +
                  ', Amount: $' +
                  claim.amount +
                  ', Status: ' +
                  claim.status
                "
              >
                <div class="claim-popup-date">
                  {{ claim.date | date : 'MMM dd, yyyy' }}
                </div>
                <div class="claim-popup-info">
                  <div class="claim-popup-description">
                    {{ claim.description }}
                  </div>
                  <div class="claim-popup-provider">{{ claim.provider }}</div>
                </div>
                <div
                  class="claim-popup-amount"
                  [attr.aria-label]="'Amount: $' + claim.amount"
                >
                  \${{ claim.amount }}
                </div>
                <div
                  class="claim-popup-status"
                  [class]="claim.status"
                  [attr.aria-label]="'Status: ' + claim.status"
                >
                  {{ claim.status }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vitals Popup -->
        <div *ngIf="isVitalsPopup && vitalsData" class="vitals-popup">
          <div class="popup-header">
            <h3 id="popup-title">{{ popupTitle }}</h3>
            <button
              class="popup-close"
              (click)="hidePopup()"
              type="button"
              aria-label="Close vitals popup"
            >
              &times;
            </button>
          </div>
          <div class="popup-content vitals-content" id="popup-content">
            <div
              class="vitals-popup-grid"
              role="list"
              aria-label="Current vital signs"
            >
              <div
                class="vital-popup-item"
                role="listitem"
                [attr.aria-label]="
                  'Heart Rate: ' + vitalsData.heartRate + ' beats per minute'
                "
              >
                <div
                  class="vital-popup-icon"
                  role="img"
                  aria-label="Heart icon"
                >
                  <span aria-hidden="true">❤️</span>
                </div>
                <div class="vital-popup-info">
                  <div class="vital-popup-value">
                    {{ vitalsData.heartRate }}
                  </div>
                  <div class="vital-popup-unit">bpm</div>
                  <div class="vital-popup-label">Heart Rate</div>
                </div>
              </div>
              <div
                class="vital-popup-item"
                role="listitem"
                [attr.aria-label]="
                  'Blood Pressure: ' +
                  vitalsData.bloodPressure.systolic +
                  ' over ' +
                  vitalsData.bloodPressure.diastolic +
                  ' mmHg'
                "
              >
                <div
                  class="vital-popup-icon"
                  role="img"
                  aria-label="Blood drop icon"
                >
                  <span aria-hidden="true">🩸</span>
                </div>
                <div class="vital-popup-info">
                  <div class="vital-popup-value">
                    {{ vitalsData.bloodPressure.systolic }}/{{
                      vitalsData.bloodPressure.diastolic
                    }}
                  </div>
                  <div class="vital-popup-unit">mmHg</div>
                  <div class="vital-popup-label">Blood Pressure</div>
                </div>
              </div>
              <div
                class="vital-popup-item"
                role="listitem"
                [attr.aria-label]="
                  'Blood Sugar: ' + vitalsData.bloodSugar + ' mg/dL'
                "
              >
                <div
                  class="vital-popup-icon"
                  role="img"
                  aria-label="Candy icon"
                >
                  <span aria-hidden="true">🍭</span>
                </div>
                <div class="vital-popup-info">
                  <div class="vital-popup-value">
                    {{ vitalsData.bloodSugar }}
                  </div>
                  <div class="vital-popup-unit">mg/dL</div>
                  <div class="vital-popup-label">Blood Sugar</div>
                </div>
              </div>
              <div class="vital-popup-item">
                <div class="vital-popup-icon">⚖️</div>
                <div class="vital-popup-info">
                  <div class="vital-popup-value">
                    {{ vitalsData.bmi | number : '1.1-1' }}
                  </div>
                  <div class="vital-popup-unit">BMI</div>
                  <div class="vital-popup-label">Body Mass Index</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Medication Popup -->
        <div
          *ngIf="isMedicationPopup && medicationData"
          class="medication-popup"
        >
          <div class="popup-header">
            <h3>{{ popupTitle }}</h3>
            <button class="popup-close" (click)="hidePopup()">&times;</button>
          </div>
          <div class="popup-content medication-content">
            <div class="medication-popup-list">
              <div
                class="medication-popup-item"
                *ngFor="let med of medicationData.slice(0, 4)"
              >
                <div class="med-popup-info">
                  <div class="med-popup-name">{{ med.name }}</div>
                  <div class="med-popup-dosage">{{ med.dosage }}</div>
                  <div class="med-popup-frequency">{{ med.frequency }}</div>
                </div>
                <div
                  class="med-popup-status"
                  [class]="med.adherence > 80 ? 'good' : 'needs-attention'"
                >
                  {{ med.adherence }}% adherence
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Goals Popup -->
        <div *ngIf="isGoalsPopup && goalData" class="goals-popup">
          <div class="popup-header">
            <h3>{{ popupTitle }}</h3>
            <button class="popup-close" (click)="hidePopup()">&times;</button>
          </div>
          <div class="popup-content goals-content">
            <div class="goals-popup-list">
              <div
                class="goal-popup-item"
                *ngFor="let goal of goalData.slice(0, 4)"
              >
                <div class="goal-popup-header">
                  <div class="goal-popup-title">{{ goal.title }}</div>
                  <div class="goal-popup-target">Target: {{ goal.target }}</div>
                </div>
                <div class="goal-popup-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      [style.width.%]="(goal.current / goal.targetValue) * 100"
                    ></div>
                  </div>
                  <div class="goal-popup-stats">
                    <span
                      >{{ goal.current }} / {{ goal.targetValue }}
                      {{ goal.unit }}</span
                    >
                    <span class="goal-popup-percentage"
                      >{{
                        (goal.current / goal.targetValue) * 100
                          | number : '1.0-0'
                      }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Benefits Popup -->
        <div *ngIf="isBenefitsPopup && benefitsData" class="benefits-popup">
          <div class="popup-header">
            <h3>{{ popupTitle }}</h3>
            <button class="popup-close" (click)="hidePopup()">&times;</button>
          </div>
          <div class="popup-content benefits-content">
            <div class="benefits-popup-overview">
              <div class="benefit-popup-item">
                <div class="benefit-popup-label">Annual Deductible</div>
                <div class="benefit-popup-value">
                  \${{ benefitsData.deductible.used | number }} / \${{
                    benefitsData.deductible.total | number
                  }}
                </div>
                <div class="benefit-popup-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      [style.width.%]="
                        (benefitsData.deductible.used /
                          benefitsData.deductible.total) *
                        100
                      "
                    ></div>
                  </div>
                </div>
              </div>
              <div class="benefit-popup-item">
                <div class="benefit-popup-label">Out-of-Pocket Max</div>
                <div class="benefit-popup-value">
                  \${{ benefitsData.outOfPocket.used | number }} / \${{
                    benefitsData.outOfPocket.total | number
                  }}
                </div>
                <div class="benefit-popup-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      [style.width.%]="
                        (benefitsData.outOfPocket.used /
                          benefitsData.outOfPocket.total) *
                        100
                      "
                    ></div>
                  </div>
                </div>
              </div>
              <div class="coverage-popup-details">
                <div class="coverage-popup-item">
                  <span>Medical Coverage:</span>
                  <span class="coverage-popup-value"
                    >{{ benefitsData.medicalCoverage }}%</span
                  >
                </div>
                <div class="coverage-popup-item">
                  <span>Prescription Coverage:</span>
                  <span class="coverage-popup-value"
                    >{{ benefitsData.prescriptionCoverage }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="health-dashboard" *ngIf="healthData">
      <div class="dashboard-header">
        <h2>🏥 Health Dashboard</h2>
        <p>Your comprehensive health overview</p>
        <div class="test-buttons">
          <button class="test-popup-btn" (click)="testPopup()">
            Test Popup
          </button>
          <button class="test-claims-btn" (click)="testClaimsPopup()">
            Test Claims
          </button>
          <button class="test-vitals-btn" (click)="testVitalsPopup()">
            Test Vitals
          </button>
          <button class="test-medication-btn" (click)="testMedicationPopup()">
            Test Medication
          </button>
          <button class="test-goals-btn" (click)="testGoalsPopup()">
            Test Goals
          </button>
          <button class="test-benefits-btn" (click)="testBenefitsPopup()">
            Test Benefits
          </button>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Risk Assessment Card -->
        <div class="card risk-assessment">
          <h3>🎯 Risk Assessment</h3>
          <div
            class="risk-score"
            [class]="getRiskClass(healthData.riskAssessment.overallRisk)"
          >
            <div class="score-circle">
              <span class="score-number">{{
                healthData.riskAssessment.overallRisk
              }}</span>
              <span class="score-label">Overall Risk</span>
            </div>
          </div>
          <div class="risk-breakdown">
            <div class="risk-item">
              <span>Cardiovascular:</span>
              <div class="risk-bar">
                <div
                  class="risk-fill"
                  [style.width.%]="healthData.riskAssessment.cardiovascularRisk"
                ></div>
              </div>
              <span>{{ healthData.riskAssessment.cardiovascularRisk }}%</span>
            </div>
            <div class="risk-item">
              <span>Diabetes:</span>
              <div class="risk-bar">
                <div
                  class="risk-fill"
                  [style.width.%]="healthData.riskAssessment.diabetesRisk"
                ></div>
              </div>
              <span>{{ healthData.riskAssessment.diabetesRisk }}%</span>
            </div>
            <div class="risk-item">
              <span>Hypertension:</span>
              <div class="risk-bar">
                <div
                  class="risk-fill"
                  [style.width.%]="healthData.riskAssessment.hypertensionRisk"
                ></div>
              </div>
              <span>{{ healthData.riskAssessment.hypertensionRisk }}%</span>
            </div>
          </div>
        </div>

        <!-- Vital Signs Card -->
        <div class="card vitals">
          <h3>📊 Vital Signs</h3>
          <div class="vitals-grid">
            <div class="vital-item">
              <div class="vital-icon">❤️</div>
              <div class="vital-info">
                <span class="vital-value">{{
                  healthData.metrics.heartRate
                }}</span>
                <span class="vital-unit">bpm</span>
                <span class="vital-label">Heart Rate</span>
              </div>
            </div>
            <div class="vital-item">
              <div class="vital-icon">🩸</div>
              <div class="vital-info">
                <span class="vital-value"
                  >{{ healthData.metrics.bloodPressure.systolic }}/{{
                    healthData.metrics.bloodPressure.diastolic
                  }}</span
                >
                <span class="vital-unit">mmHg</span>
                <span class="vital-label">Blood Pressure</span>
              </div>
            </div>
            <div class="vital-item">
              <div class="vital-icon">🍭</div>
              <div class="vital-info">
                <span class="vital-value">{{
                  healthData.metrics.bloodSugar
                }}</span>
                <span class="vital-unit">mg/dL</span>
                <span class="vital-label">Blood Sugar</span>
              </div>
            </div>
            <div class="vital-item">
              <div class="vital-icon">⚖️</div>
              <div class="vital-info">
                <span class="vital-value">{{
                  healthData.metrics.bmi | number : '1.1-1'
                }}</span>
                <span class="vital-unit">BMI</span>
                <span class="vital-label">Body Mass Index</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Claims Card -->
        <div class="card claims">
          <h3>📋 Recent Claims</h3>
          <div class="claims-list">
            <div
              class="claim-item"
              *ngFor="let claim of healthData.claims.slice(0, 3)"
            >
              <div class="claim-date">{{ claim.date | date : 'MMM dd' }}</div>
              <div class="claim-info">
                <div class="claim-description">{{ claim.description }}</div>
                <div class="claim-provider">{{ claim.provider }}</div>
              </div>
              <div class="claim-amount">\${{ claim.amount }}</div>
              <div class="claim-status" [class]="claim.status">
                {{ claim.status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations Card -->
        <div class="card recommendations">
          <h3>💡 Recommendations</h3>
          <div class="recommendations-list">
            <div
              class="recommendation-item"
              *ngFor="let rec of healthData.riskAssessment.recommendations"
            >
              <div class="recommendation-icon">✅</div>
              <span>{{ rec }}</span>
            </div>
          </div>
        </div>

        <!-- Medication Tracker Card -->
        <div class="card medication-card">
          <h3>💊 Medication Tracker</h3>
          <div class="medication-list">
            <div
              class="medication-item"
              *ngFor="let med of healthData.medications"
            >
              <div class="med-info">
                <div class="med-name">{{ med.name }}</div>
                <div class="med-dosage">{{ med.dosage }}</div>
                <div class="med-frequency">{{ med.frequency }}</div>
              </div>
              <div
                class="med-status"
                [class]="med.adherence > 80 ? 'good' : 'needs-attention'"
              >
                {{ med.adherence }}% adherence
              </div>
            </div>
          </div>
        </div>

        <!-- Care Team Card -->
        <div class="card provider-card">
          <h3>👩‍⚕️ Care Team</h3>
          <div class="provider-list">
            <div
              class="provider-item"
              *ngFor="let provider of healthData.careTeam"
            >
              <div class="provider-avatar">
                {{ provider.specialty.charAt(0) }}
              </div>
              <div class="provider-info">
                <div class="provider-name">{{ provider.name }}</div>
                <div class="provider-specialty">{{ provider.specialty }}</div>
                <div class="provider-contact">{{ provider.phone }}</div>
              </div>
              <div class="provider-status">
                <span class="next-appointment"
                  >Next: {{ provider.nextAppointment | date : 'MMM dd' }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Wellness Programs Card -->
        <div class="card wellness-card">
          <h3>🌟 Wellness Programs</h3>
          <div class="wellness-list">
            <div
              class="wellness-item"
              *ngFor="let program of healthData.wellnessPrograms"
            >
              <div class="wellness-icon">{{ program.icon }}</div>
              <div class="wellness-info">
                <div class="wellness-name">{{ program.name }}</div>
                <div class="wellness-description">
                  {{ program.description }}
                </div>
                <div class="wellness-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      [style.width.%]="program.progress"
                    ></div>
                  </div>
                  <span>{{ program.progress }}% complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Goals Card -->
        <div class="card goals-card">
          <h3>🎯 Health Goals</h3>
          <div class="goals-list">
            <div class="goal-item" *ngFor="let goal of healthData.healthGoals">
              <div class="goal-header">
                <div class="goal-title">{{ goal.title }}</div>
                <div class="goal-target">Target: {{ goal.target }}</div>
              </div>
              <div class="goal-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width.%]="(goal.current / goal.targetValue) * 100"
                  ></div>
                </div>
                <div class="goal-stats">
                  <span
                    >{{ goal.current }} / {{ goal.targetValue }}
                    {{ goal.unit }}</span
                  >
                  <span class="goal-percentage"
                    >{{
                      (goal.current / goal.targetValue) * 100
                        | number : '1.0-0'
                    }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Benefits Summary Card -->
        <div class="card benefits-card">
          <h3>🏥 Benefits Summary</h3>
          <div class="benefits-overview">
            <div class="benefit-item">
              <div class="benefit-label">Annual Deductible</div>
              <div class="benefit-value">
                \${{ healthData.benefits.deductible.used | number }} / \${{
                  healthData.benefits.deductible.total | number
                }}
              </div>
              <div class="benefit-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width.%]="
                      (healthData.benefits.deductible.used /
                        healthData.benefits.deductible.total) *
                      100
                    "
                  ></div>
                </div>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-label">Out-of-Pocket Max</div>
              <div class="benefit-value">
                \${{ healthData.benefits.outOfPocket.used | number }} / \${{
                  healthData.benefits.outOfPocket.total | number
                }}
              </div>
              <div class="benefit-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width.%]="
                      (healthData.benefits.outOfPocket.used /
                        healthData.benefits.outOfPocket.total) *
                      100
                    "
                  ></div>
                </div>
              </div>
            </div>
            <div class="coverage-details">
              <div class="coverage-item">
                <span>Medical Coverage:</span>
                <span class="coverage-value"
                  >{{ healthData.benefits.medicalCoverage }}%</span
                >
              </div>
              <div class="coverage-item">
                <span>Prescription Coverage:</span>
                <span class="coverage-value"
                  >{{ healthData.benefits.prescriptionCoverage }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Health Insights Card -->
        <div class="card insights-card">
          <h3>📈 Health Insights</h3>
          <div class="insights-list">
            <div
              class="insight-item"
              *ngFor="let insight of healthData.healthInsights"
            >
              <div class="insight-icon" [class]="insight.type">
                {{ insight.icon }}
              </div>
              <div class="insight-content">
                <div class="insight-title">{{ insight.title }}</div>
                <div class="insight-description">{{ insight.description }}</div>
                <div class="insight-trend" [class]="insight.trend">
                  {{
                    insight.trend === 'improving'
                      ? '📈 Improving'
                      : insight.trend === 'declining'
                      ? '📉 Needs Attention'
                      : '➡️ Stable'
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
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

      .health-dashboard {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .dashboard-header h2 {
        font-size: 2.5em;
        margin: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .test-popup-btn,
      .test-claims-btn,
      .test-vitals-btn,
      .test-medication-btn,
      .test-goals-btn,
      .test-benefits-btn {
        margin: 3px;
        padding: 6px 12px;
        color: white;
        border: none;
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        transition: transform 0.2s ease;
        font-weight: 500;
      }

      .test-popup-btn:hover,
      .test-claims-btn:hover,
      .test-vitals-btn:hover,
      .test-medication-btn:hover,
      .test-goals-btn:hover,
      .test-benefits-btn:hover {
        transform: translateY(-2px);
      }

      .test-popup-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .test-claims-btn {
        background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
      }

      .test-vitals-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .test-medication-btn {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      }

      .test-goals-btn {
        background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
      }

      .test-benefits-btn {
        background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
      }

      .test-buttons {
        margin-top: 15px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 5px;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .card {
        background: white;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
      }

      .card h3 {
        margin: 0 0 15px 0;
        font-size: 1.2em;
        color: #333;
      }

      /* Risk Assessment Styles */
      .risk-assessment {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: white;
      }

      .score-circle {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        backdrop-filter: blur(10px);
      }

      .score-number {
        font-size: 2em;
        font-weight: bold;
      }

      .score-label {
        font-size: 0.8em;
        opacity: 0.9;
      }

      .risk-breakdown {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .risk-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9em;
      }

      .risk-bar {
        flex: 1;
        height: 8px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        overflow: hidden;
      }

      .risk-fill {
        height: 100%;
        background: white;
        transition: width 0.3s ease;
      }

      /* Vitals Styles */
      .vitals-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      .vital-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .vital-icon {
        font-size: 1.5em;
      }

      .vital-info {
        display: flex;
        flex-direction: column;
      }

      .vital-value {
        font-size: 1.2em;
        font-weight: bold;
        color: #333;
      }

      .vital-unit {
        font-size: 0.8em;
        color: #666;
      }

      .vital-label {
        font-size: 0.9em;
        color: #888;
      }

      /* Claims Styles */
      .claims-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .claim-item {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 10px;
        align-items: center;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        font-size: 0.9em;
      }

      .claim-date {
        font-weight: bold;
        color: #666;
      }

      .claim-description {
        font-weight: bold;
      }

      .claim-provider {
        color: #666;
        font-size: 0.8em;
      }

      .claim-amount {
        font-weight: bold;
        color: #28a745;
      }

      .claim-status {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        text-transform: uppercase;
      }

      .claim-status.approved {
        background: #d4edda;
        color: #155724;
      }

      .claim-status.pending {
        background: #fff3cd;
        color: #856404;
      }

      .claim-status.denied {
        background: #f8d7da;
        color: #721c24;
      }

      /* Recommendations Styles */
      .recommendations-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .recommendation-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px;
        background: #e8f5e8;
        border-radius: 8px;
        font-size: 0.9em;
      }

      .recommendation-icon {
        margin-top: 2px;
      }

      /* Risk Classes */
      .low-risk .score-circle {
        background: rgba(40, 167, 69, 0.2);
      }

      .medium-risk .score-circle {
        background: rgba(255, 193, 7, 0.2);
      }

      .high-risk .score-circle {
        background: rgba(220, 53, 69, 0.2);
      }

      /* Highlight effect for voice commands */
      .highlighted {
        animation: highlight 3s ease-in-out;
        transform: scale(1.02);
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3) !important;
        border: 2px solid #667eea !important;
      }

      @keyframes highlight {
        0% {
          transform: scale(1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        50% {
          transform: scale(1.02);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
      }

      /* Medication Card Styles */
      .medication-card {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        color: white;
      }

      .medication-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .medication-item {
        background: rgba(255, 255, 255, 0.2);
        padding: 12px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .med-info {
        flex: 1;
      }

      .med-name {
        font-weight: bold;
        font-size: 16px;
      }

      .med-dosage {
        font-size: 14px;
        opacity: 0.9;
      }

      .med-frequency {
        font-size: 12px;
        opacity: 0.8;
      }

      .med-status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
      }

      .med-status.good {
        background: rgba(40, 167, 69, 0.8);
      }

      .med-status.needs-attention {
        background: rgba(220, 53, 69, 0.8);
      }

      /* Care Team Card Styles */
      .provider-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .provider-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .provider-item {
        background: rgba(255, 255, 255, 0.2);
        padding: 15px;
        border-radius: 8px;
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .provider-avatar {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
      }

      .provider-info {
        flex: 1;
      }

      .provider-name {
        font-weight: bold;
        font-size: 16px;
      }

      .provider-specialty {
        font-size: 14px;
        opacity: 0.9;
      }

      .provider-contact {
        font-size: 12px;
        opacity: 0.8;
      }

      .next-appointment {
        font-size: 12px;
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        border-radius: 12px;
      }

      /* Wellness Programs Card Styles */
      .wellness-card {
        background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
        color: #2d3436;
      }

      .wellness-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .wellness-item {
        background: rgba(255, 255, 255, 0.3);
        padding: 15px;
        border-radius: 8px;
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .wellness-icon {
        font-size: 24px;
        width: 40px;
        text-align: center;
      }

      .wellness-info {
        flex: 1;
      }

      .wellness-name {
        font-weight: bold;
        font-size: 16px;
      }

      .wellness-description {
        font-size: 14px;
        opacity: 0.8;
        margin: 4px 0;
      }

      .wellness-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }

      .progress-bar {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: #00b894;
        transition: width 0.3s ease;
      }

      /* Health Goals Card Styles */
      .goals-card {
        background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
        color: white;
      }

      .goals-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .goal-item {
        background: rgba(255, 255, 255, 0.2);
        padding: 15px;
        border-radius: 8px;
      }

      .goal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .goal-title {
        font-weight: bold;
        font-size: 16px;
      }

      .goal-target {
        font-size: 12px;
        opacity: 0.8;
      }

      .goal-progress {
        margin-top: 8px;
      }

      .goal-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        font-size: 14px;
      }

      .goal-percentage {
        font-weight: bold;
      }

      /* Benefits Card Styles */
      .benefits-card {
        background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
        color: white;
      }

      .benefits-overview {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .benefit-item {
        background: rgba(255, 255, 255, 0.2);
        padding: 12px;
        border-radius: 8px;
      }

      .benefit-label {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 4px;
      }

      .benefit-value {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 8px;
      }

      .benefit-progress {
        margin-top: 8px;
      }

      .coverage-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
      }

      .coverage-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 6px;
      }

      .coverage-value {
        font-weight: bold;
      }

      /* Health Insights Card Styles */
      .insights-card {
        background: linear-gradient(135deg, #00cec9 0%, #0984e3 100%);
        color: white;
      }

      .insights-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .insight-item {
        background: rgba(255, 255, 255, 0.2);
        padding: 12px;
        border-radius: 8px;
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .insight-icon {
        font-size: 20px;
        width: 32px;
        text-align: center;
        margin-top: 2px;
      }

      .insight-content {
        flex: 1;
      }

      .insight-title {
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .insight-description {
        font-size: 13px;
        opacity: 0.9;
        margin-bottom: 6px;
      }

      .insight-trend {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.2);
        display: inline-block;
      }

      .insight-trend.improving {
        background: rgba(40, 167, 69, 0.6);
      }

      .insight-trend.declining {
        background: rgba(220, 53, 69, 0.6);
      }

      .insight-trend.stable {
        background: rgba(255, 193, 7, 0.6);
      }

      /* Popup Modal Styles */
      .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.3s ease-in-out;
        padding: 20px;
        box-sizing: border-box;
        margin: 0;
        transform: none;
        /* Alternative centering methods */
        place-items: center;
        place-content: center;
      }

      .popup-modal {
        background: white;
        border-radius: 15px;
        min-width: 400px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
        position: static;
        margin: auto;
        transform: none;
        flex-shrink: 0;
        display: block;
        left: auto;
        right: auto;
        top: auto;
        bottom: auto;
        /* Ensure no positioning overrides */
        translate: none;
        inset: auto;
      }

      .popup-header {
        padding: 20px 25px 15px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .popup-header h3 {
        margin: 0;
        font-size: 1.4em;
        font-weight: 600;
      }

      .popup-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s ease;
      }

      .popup-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .popup-content {
        padding: 25px;
        text-align: center;
      }

      .popup-content p {
        margin: 0;
        font-size: 16px;
        line-height: 1.5;
        color: #333;
      }

      .popup-footer {
        padding: 15px 25px 25px;
        display: flex;
        justify-content: center;
      }

      .popup-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .popup-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      /* Popup Type Variations */
      .popup-success .popup-header {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      }

      .popup-success .popup-button {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
      }

      .popup-warning .popup-header {
        background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      }

      .popup-warning .popup-button {
        background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
        box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
      }

      .popup-error .popup-header {
        background: linear-gradient(135deg, #dc3545 0%, #e91e63 100%);
      }

      .popup-error .popup-button {
        background: linear-gradient(135deg, #dc3545 0%, #e91e63 100%);
        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
      }

      /* Animations */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.9);
        }
      }

      /* Claims Popup Specific Styles */
      .claims-popup {
        width: 100%;
      }

      .claims-content {
        padding: 0 !important;
      }

      .claims-popup-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .claim-popup-item {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 15px;
        align-items: center;
        padding: 15px 25px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        transition: background-color 0.2s ease;
      }

      .claim-popup-item:last-child {
        border-bottom: none;
      }

      .claim-popup-item:hover {
        background-color: #f8f9fa;
      }

      .claim-popup-date {
        font-weight: bold;
        color: #666;
        min-width: 80px;
      }

      .claim-popup-info {
        flex: 1;
      }

      .claim-popup-description {
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }

      .claim-popup-provider {
        color: #666;
        font-size: 12px;
      }

      .claim-popup-amount {
        font-weight: bold;
        color: #28a745;
        font-size: 16px;
        min-width: 80px;
        text-align: right;
      }

      .claim-popup-status {
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 11px;
        text-transform: uppercase;
        font-weight: bold;
        min-width: 70px;
        text-align: center;
      }

      .claim-popup-status.approved {
        background: #d4edda;
        color: #155724;
      }

      .claim-popup-status.pending {
        background: #fff3cd;
        color: #856404;
      }

      .claim-popup-status.denied {
        background: #f8d7da;
        color: #721c24;
      }

      /* Claims popup animation duration - 5 seconds */
      .claims-popup .popup-modal {
        animation: slideIn 0.4s ease-out;
      }

      .popup-overlay.fade-out {
        animation: fadeOut 0.4s ease-in;
      }

      /* Vitals Popup Styles */
      .vitals-popup {
        width: 100%;
      }

      .vitals-content {
        padding: 0 !important;
      }

      .vitals-popup-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        padding: 20px;
      }

      .vital-popup-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }

      .vital-popup-icon {
        font-size: 24px;
        width: 40px;
        text-align: center;
      }

      .vital-popup-info {
        flex: 1;
      }

      .vital-popup-value {
        font-size: 20px;
        font-weight: bold;
        color: #333;
        margin-bottom: 2px;
      }

      .vital-popup-unit {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .vital-popup-label {
        font-size: 14px;
        color: #888;
      }

      /* Medication Popup Styles */
      .medication-popup {
        width: 100%;
      }

      .medication-content {
        padding: 0 !important;
      }

      .medication-popup-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .medication-popup-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 25px;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s ease;
      }

      .medication-popup-item:last-child {
        border-bottom: none;
      }

      .medication-popup-item:hover {
        background-color: #f8f9fa;
      }

      .med-popup-info {
        flex: 1;
      }

      .med-popup-name {
        font-weight: bold;
        font-size: 16px;
        color: #333;
        margin-bottom: 4px;
      }

      .med-popup-dosage {
        font-size: 14px;
        color: #666;
        margin-bottom: 2px;
      }

      .med-popup-frequency {
        font-size: 12px;
        color: #888;
      }

      .med-popup-status {
        padding: 6px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        min-width: 100px;
      }

      .med-popup-status.good {
        background: #d4edda;
        color: #155724;
      }

      .med-popup-status.needs-attention {
        background: #f8d7da;
        color: #721c24;
      }

      /* Goals Popup Styles */
      .goals-popup {
        width: 100%;
      }

      .goals-content {
        padding: 0 !important;
      }

      .goals-popup-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .goal-popup-item {
        padding: 20px 25px;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s ease;
      }

      .goal-popup-item:last-child {
        border-bottom: none;
      }

      .goal-popup-item:hover {
        background-color: #f8f9fa;
      }

      .goal-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .goal-popup-title {
        font-weight: bold;
        font-size: 16px;
        color: #333;
      }

      .goal-popup-target {
        font-size: 12px;
        color: #666;
        background: #f8f9fa;
        padding: 4px 8px;
        border-radius: 10px;
      }

      .goal-popup-progress {
        margin-top: 10px;
      }

      .goal-popup-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        font-size: 14px;
      }

      .goal-popup-percentage {
        font-weight: bold;
        color: #667eea;
      }

      /* Benefits Popup Styles */
      .benefits-popup {
        width: 100%;
      }

      .benefits-content {
        padding: 0 !important;
      }

      .benefits-popup-overview {
        padding: 20px;
      }

      .benefit-popup-item {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #fd79a8;
      }

      .benefit-popup-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
        font-weight: 500;
      }

      .benefit-popup-value {
        font-weight: bold;
        font-size: 16px;
        color: #333;
        margin-bottom: 10px;
      }

      .benefit-popup-progress {
        margin-top: 10px;
      }

      .coverage-popup-details {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 15px;
      }

      .coverage-popup-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: #f8f9fa;
        border-radius: 6px;
        font-size: 14px;
      }

      .coverage-popup-value {
        font-weight: bold;
        color: #667eea;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .popup-overlay {
          padding: 10px;
        }

        .popup-modal {
          min-width: 280px;
          width: calc(100vw - 40px);
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 40px);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .popup-content {
          padding: 20px;
        }

        .popup-header {
          padding: 15px 20px 10px;
        }

        .popup-footer {
          padding: 10px 20px 20px;
        }
      }

      /* Additional popup centering for all screen sizes */
      @media (min-width: 1px) {
        .popup-overlay {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center;
        }

        .popup-modal {
          margin: auto !important;
          position: static !important;
          transform: none !important;
          left: auto !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;
        }
      }
    `,
  ],
})
export class HealthDashboardComponent implements OnInit, OnDestroy {
  healthData: HealthData | null = null;
  private subscription: Subscription = new Subscription();

  // Popup/Modal properties
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupType = 'info'; // 'info', 'success', 'warning', 'error'
  claimsData: any = null;
  vitalsData: any = null;
  medicationData: any = null;
  goalData: any = null;
  benefitsData: any = null;
  isClaimsPopup = false;
  isVitalsPopup = false;
  isMedicationPopup = false;
  isGoalsPopup = false;
  isBenefitsPopup = false;

  constructor(
    private analyticsService: AnalyticsService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    console.log('HealthDashboardComponent ngOnInit called');
    this.subscription.add(
      this.analyticsService.getHealthData().subscribe((data) => {
        console.log('Analytics data received:', data);
        this.healthData = data;
        if (data) {
          console.log('Health goals data:', data.healthGoals);
        }
      })
    );

    // Subscribe to popup service
    this.subscription.add(
      this.popupService.popup$.subscribe((popupData) => {
        console.log('🎭 Health Dashboard: Popup data received:', popupData);
        this.showPopup = popupData.show;
        this.popupTitle = popupData.title;
        this.popupMessage = popupData.message;
        this.popupType = popupData.type;
        this.claimsData = popupData.claimsData || null;
        this.vitalsData = popupData.vitalsData || null;
        this.medicationData = popupData.medicationData || null;
        this.goalData = popupData.goalData || null;
        this.benefitsData = popupData.benefitsData || null;
        this.isClaimsPopup = popupData.isClaimsPopup || false;
        this.isVitalsPopup = popupData.isVitalsPopup || false;
        this.isMedicationPopup = popupData.isMedicationPopup || false;
        this.isGoalsPopup = popupData.isGoalsPopup || false;
        this.isBenefitsPopup = popupData.isBenefitsPopup || false;

        console.log('🎭 Health Dashboard state after update:', {
          showPopup: this.showPopup,
          isVitalsPopup: this.isVitalsPopup,
          vitalsData: this.vitalsData,
          isMedicationPopup: this.isMedicationPopup,
          medicationData: this.medicationData
        });

        if (this.isGoalsPopup) {
          console.log('Goals popup activated, goalData:', this.goalData);
        }
        
        if (this.isVitalsPopup) {
          console.log('✅ Vitals popup activated, vitalsData:', this.vitalsData);
        }
        
        if (this.isMedicationPopup) {
          console.log('✅ Medication popup activated, medicationData:', this.medicationData);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getRiskClass(riskScore: number): string {
    if (riskScore < 30) return 'low-risk';
    if (riskScore < 60) return 'medium-risk';
    return 'high-risk';
  }

  // Popup methods
  showVoiceCommandPopup(
    title: string,
    message: string,
    type: string = 'info'
  ): void {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;

    // Auto-hide popup after 3 seconds
    setTimeout(() => {
      this.hidePopup();
    }, 3000);
  }

  hidePopup(): void {
    this.popupService.hidePopup();
  }

  // Test method to manually trigger popup
  testPopup(): void {
    this.popupService.showPopup(
      'Test Popup',
      'This is a test popup to verify center positioning',
      'info'
    );
  }

  // Test method for claims popup
  testClaimsPopup(): void {
    if (this.healthData?.claims) {
      this.popupService.showClaimsPopup(this.healthData.claims);
    }
  }

  // Test method for vitals popup
  testVitalsPopup(): void {
    if (this.healthData?.metrics) {
      this.popupService.showVitalsPopup(this.healthData.metrics);
    }
  }

  // Test method for medication popup
  testMedicationPopup(): void {
    if (this.healthData?.medications) {
      this.popupService.showMedicationPopup(this.healthData.medications);
    }
  }

  // Test method for goals popup - ENHANCED FOR DEBUGGING
  testGoalsPopup(): void {
    console.log('=== GOALS POPUP TEST STARTED ===');
    console.log('testGoalsPopup called');
    console.log('healthData exists:', !!this.healthData);
    console.log('healthData:', this.healthData);
    console.log('healthGoals exists:', !!this.healthData?.healthGoals);
    console.log('healthGoals:', this.healthData?.healthGoals);

    // Force test with hardcoded data to ensure popup works
    const testGoals = [
      {
        title: 'Daily Steps',
        target: '10,000 steps per day',
        current: 8500,
        targetValue: 10000,
        unit: 'steps',
        deadline: new Date('2025-06-01'),
        category: 'Fitness',
      },
      {
        title: 'Weight Loss',
        target: 'Lose 15 pounds',
        current: 10,
        targetValue: 15,
        unit: 'lbs',
        deadline: new Date('2025-05-01'),
        category: 'Weight Management',
      },
      {
        title: 'Blood Pressure',
        target: 'Maintain BP under 130/80',
        current: 125,
        targetValue: 130,
        unit: 'mmHg',
        deadline: new Date('2025-12-31'),
        category: 'Cardiovascular',
      },
    ];

    console.log('About to call showGoalsPopup with test data:', testGoals);
    this.popupService.showGoalsPopup(testGoals);
    console.log('showGoalsPopup called successfully');
    console.log('=== GOALS POPUP TEST COMPLETED ===');
  }

  // Test method for benefits popup
  testBenefitsPopup(): void {
    if (this.healthData?.benefits) {
      this.popupService.showBenefitsPopup(this.healthData.benefits);
    }
  }
}
