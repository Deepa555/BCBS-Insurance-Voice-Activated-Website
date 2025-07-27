import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AnalyticsService, HealthData } from '../analytics/analytics.service';

@Component({
  selector: 'app-health-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health-dashboard" *ngIf="healthData">
      <div class="dashboard-header">
        <h2>🏥 Health Dashboard</h2>
        <p>Your comprehensive health overview</p>
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
            <div class="medication-item" *ngFor="let med of healthData.medications">
              <div class="med-info">
                <div class="med-name">{{ med.name }}</div>
                <div class="med-dosage">{{ med.dosage }}</div>
                <div class="med-frequency">{{ med.frequency }}</div>
              </div>
              <div class="med-status" [class]="med.adherence > 80 ? 'good' : 'needs-attention'">
                {{ med.adherence }}% adherence
              </div>
            </div>
          </div>
        </div>

        <!-- Care Team Card -->
        <div class="card provider-card">
          <h3>👩‍⚕️ Care Team</h3>
          <div class="provider-list">
            <div class="provider-item" *ngFor="let provider of healthData.careTeam">
              <div class="provider-avatar">{{ provider.specialty.charAt(0) }}</div>
              <div class="provider-info">
                <div class="provider-name">{{ provider.name }}</div>
                <div class="provider-specialty">{{ provider.specialty }}</div>
                <div class="provider-contact">{{ provider.phone }}</div>
              </div>
              <div class="provider-status">
                <span class="next-appointment">Next: {{ provider.nextAppointment | date:'MMM dd' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Wellness Programs Card -->
        <div class="card wellness-card">
          <h3>🌟 Wellness Programs</h3>
          <div class="wellness-list">
            <div class="wellness-item" *ngFor="let program of healthData.wellnessPrograms">
              <div class="wellness-icon">{{ program.icon }}</div>
              <div class="wellness-info">
                <div class="wellness-name">{{ program.name }}</div>
                <div class="wellness-description">{{ program.description }}</div>
                <div class="wellness-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="program.progress"></div>
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
                  <div class="progress-fill" [style.width.%]="(goal.current / goal.targetValue) * 100"></div>
                </div>
                <div class="goal-stats">
                  <span>{{ goal.current }} / {{ goal.targetValue }} {{ goal.unit }}</span>
                  <span class="goal-percentage">{{ ((goal.current / goal.targetValue) * 100) | number:'1.0-0' }}%</span>
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
              <div class="benefit-value">\${{ healthData.benefits.deductible.used | number }} / \${{ healthData.benefits.deductible.total | number }}</div>
              <div class="benefit-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(healthData.benefits.deductible.used / healthData.benefits.deductible.total) * 100"></div>
                </div>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-label">Out-of-Pocket Max</div>
              <div class="benefit-value">\${{ healthData.benefits.outOfPocket.used | number }} / \${{ healthData.benefits.outOfPocket.total | number }}</div>
              <div class="benefit-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(healthData.benefits.outOfPocket.used / healthData.benefits.outOfPocket.total) * 100"></div>
                </div>
              </div>
            </div>
            <div class="coverage-details">
              <div class="coverage-item">
                <span>Medical Coverage:</span>
                <span class="coverage-value">{{ healthData.benefits.medicalCoverage }}%</span>
              </div>
              <div class="coverage-item">
                <span>Prescription Coverage:</span>
                <span class="coverage-value">{{ healthData.benefits.prescriptionCoverage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Insights Card -->
        <div class="card insights-card">
          <h3>📈 Health Insights</h3>
          <div class="insights-list">
            <div class="insight-item" *ngFor="let insight of healthData.healthInsights">
              <div class="insight-icon" [class]="insight.type">{{ insight.icon }}</div>
              <div class="insight-content">
                <div class="insight-title">{{ insight.title }}</div>
                <div class="insight-description">{{ insight.description }}</div>
                <div class="insight-trend" [class]="insight.trend">
                  {{ insight.trend === 'improving' ? '📈 Improving' : insight.trend === 'declining' ? '📉 Needs Attention' : '➡️ Stable' }}
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
    `,
  ],
})
export class HealthDashboardComponent implements OnInit, OnDestroy {
  healthData: HealthData | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.analyticsService.getHealthData().subscribe((data) => {
        this.healthData = data;
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
}
