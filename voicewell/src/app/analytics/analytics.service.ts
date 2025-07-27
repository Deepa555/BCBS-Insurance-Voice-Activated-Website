import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface HealthMetrics {
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  bloodSugar: number;
  cholesterol: { total: number; hdl: number; ldl: number };
  bmi: number;
  weight: number;
  height: number;
}

export interface ClaimData {
  id: string;
  date: Date;
  type: string;
  amount: number;
  description: string;
  provider: string;
  status: 'approved' | 'pending' | 'denied';
}

export interface RiskAssessment {
  overallRisk: number; // 0-100
  cardiovascularRisk: number;
  diabetesRisk: number;
  hypertensionRisk: number;
  recommendations: string[];
  lastUpdated: Date;
}

export interface HealthData {
  userId: string;
  metrics: HealthMetrics;
  claims: ClaimData[];
  riskAssessment: RiskAssessment;
  lifestyle: {
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
    exerciseFrequency: number; // times per week
    sleepHours: number;
    stressLevel: number; // 1-10
  };
  medications: MedicationData[];
  careTeam: CareTeamMember[];
  wellnessPrograms: WellnessProgram[];
  healthGoals: HealthGoal[];
  benefits: BenefitsData;
  healthInsights: HealthInsight[];
}

export interface MedicationData {
  name: string;
  dosage: string;
  frequency: string;
  adherence: number; // percentage
  prescriber: string;
  refillDate: Date;
}

export interface CareTeamMember {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  nextAppointment: Date;
  location: string;
}

export interface WellnessProgram {
  name: string;
  description: string;
  icon: string;
  progress: number; // percentage
  target: string;
  enrolled: boolean;
}

export interface HealthGoal {
  title: string;
  target: string;
  current: number;
  targetValue: number;
  unit: string;
  deadline: Date;
  category: string;
}

export interface BenefitsData {
  deductible: {
    used: number;
    total: number;
  };
  outOfPocket: {
    used: number;
    total: number;
  };
  medicalCoverage: number; // percentage
  prescriptionCoverage: number; // percentage
  planName: string;
  memberId: string;
}

export interface HealthInsight {
  title: string;
  description: string;
  icon: string;
  type: 'improvement' | 'warning' | 'info';
  trend: 'improving' | 'declining' | 'stable';
  actionable: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private healthDataSubject = new BehaviorSubject<HealthData | null>(null);
  public healthData$ = this.healthDataSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Simulated user health data
    const mockData: HealthData = {
      userId: 'user123',
      metrics: {
        bloodPressure: { systolic: 125, diastolic: 82 },
        heartRate: 72,
        bloodSugar: 95,
        cholesterol: { total: 180, hdl: 45, ldl: 110 },
        bmi: 24.5,
        weight: 165,
        height: 68,
      },
      claims: [
        {
          id: 'CLM001',
          date: new Date('2024-11-15'),
          type: 'Preventive Care',
          amount: 250,
          description: 'Annual Physical Exam',
          provider: 'Dr. Smith Family Practice',
          status: 'approved',
        },
        {
          id: 'CLM002',
          date: new Date('2024-10-22'),
          type: 'Diagnostic',
          amount: 180,
          description: 'Blood Panel Analysis',
          provider: 'LabCorp',
          status: 'approved',
        },
        {
          id: 'CLM003',
          date: new Date('2024-09-30'),
          type: 'Specialist',
          amount: 320,
          description: 'Cardiologist Consultation',
          provider: 'Heart Health Specialists',
          status: 'pending',
        },
      ],
      riskAssessment: {
        overallRisk: 25,
        cardiovascularRisk: 20,
        diabetesRisk: 15,
        hypertensionRisk: 30,
        recommendations: [
          'Continue regular exercise routine',
          'Monitor blood pressure weekly',
          'Reduce sodium intake',
          'Schedule follow-up in 3 months',
        ],
        lastUpdated: new Date(),
      },
      lifestyle: {
        smokingStatus: 'never',
        alcoholConsumption: 'light',
        exerciseFrequency: 4,
        sleepHours: 7.5,
        stressLevel: 4,
      },
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          adherence: 95,
          prescriber: 'Dr. Smith',
          refillDate: new Date('2025-02-15'),
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          adherence: 88,
          prescriber: 'Dr. Johnson',
          refillDate: new Date('2025-01-20'),
        },
        {
          name: 'Vitamin D3',
          dosage: '2000 IU',
          frequency: 'Once daily',
          adherence: 92,
          prescriber: 'Dr. Smith',
          refillDate: new Date('2025-03-10'),
        },
      ],
      careTeam: [
        {
          name: 'Dr. Sarah Smith',
          specialty: 'Primary Care',
          phone: '(555) 123-4567',
          email: 'dr.smith@healthcenter.com',
          nextAppointment: new Date('2025-02-15'),
          location: 'Main Health Center',
        },
        {
          name: 'Dr. Michael Johnson',
          specialty: 'Cardiologist',
          phone: '(555) 234-5678',
          email: 'dr.johnson@heartcenter.com',
          nextAppointment: new Date('2025-03-01'),
          location: 'Heart Specialists Clinic',
        },
        {
          name: 'Lisa Rodriguez, RN',
          specialty: 'Diabetes Educator',
          phone: '(555) 345-6789',
          email: 'l.rodriguez@diabetescenter.com',
          nextAppointment: new Date('2025-02-08'),
          location: 'Diabetes Care Center',
        },
      ],
      wellnessPrograms: [
        {
          name: 'Heart Healthy Living',
          description: 'Cardiovascular wellness program',
          icon: '❤️',
          progress: 75,
          target: 'Complete 12-week program',
          enrolled: true,
        },
        {
          name: 'Diabetes Prevention',
          description: 'Lifestyle modification program',
          icon: '🍎',
          progress: 60,
          target: 'Achieve target A1C levels',
          enrolled: true,
        },
        {
          name: 'Stress Management',
          description: 'Mindfulness and stress reduction',
          icon: '🧘',
          progress: 45,
          target: 'Complete 8-week course',
          enrolled: true,
        },
      ],
      healthGoals: [
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
      ],
      benefits: {
        deductible: {
          used: 1250,
          total: 2500,
        },
        outOfPocket: {
          used: 2100,
          total: 6000,
        },
        medicalCoverage: 80,
        prescriptionCoverage: 75,
        planName: 'AZ Blue Choice Plus',
        memberId: 'AZB123456789',
      },
      healthInsights: [
        {
          title: 'Blood Pressure Trend',
          description: 'Your blood pressure has improved over the last 3 months',
          icon: '📈',
          type: 'improvement',
          trend: 'improving',
          actionable: false,
        },
        {
          title: 'Medication Adherence',
          description: 'Consider setting up automatic refills for better adherence',
          icon: '💊',
          type: 'warning',
          trend: 'stable',
          actionable: true,
        },
        {
          title: 'Exercise Progress',
          description: 'You\'re meeting your weekly exercise goals consistently',
          icon: '🏃',
          type: 'improvement',
          trend: 'improving',
          actionable: false,
        },
        {
          title: 'Sleep Quality',
          description: 'Your sleep patterns show room for improvement',
          icon: '😴',
          type: 'info',
          trend: 'declining',
          actionable: true,
        },
      ],
    };

    this.healthDataSubject.next(mockData);
  }

  calculateRiskScore(metrics: HealthMetrics, lifestyle: any): RiskAssessment {
    let cardiovascularRisk = 0;
    let diabetesRisk = 0;
    let hypertensionRisk = 0;

    // Cardiovascular risk calculation
    if (metrics.bloodPressure.systolic > 140) cardiovascularRisk += 25;
    else if (metrics.bloodPressure.systolic > 120) cardiovascularRisk += 15;

    if (metrics.cholesterol.total > 200) cardiovascularRisk += 20;
    if (metrics.cholesterol.hdl < 40) cardiovascularRisk += 15;

    if (metrics.bmi > 30) cardiovascularRisk += 20;
    else if (metrics.bmi > 25) cardiovascularRisk += 10;

    // Diabetes risk calculation
    if (metrics.bloodSugar > 100) diabetesRisk += 25;
    if (metrics.bmi > 30) diabetesRisk += 20;

    // Hypertension risk calculation
    if (metrics.bloodPressure.systolic > 130) hypertensionRisk += 30;
    if (metrics.bloodPressure.diastolic > 80) hypertensionRisk += 25;

    // Lifestyle factors
    if (lifestyle.smokingStatus === 'current') {
      cardiovascularRisk += 30;
      diabetesRisk += 15;
    }

    if (lifestyle.exerciseFrequency < 3) {
      cardiovascularRisk += 15;
      diabetesRisk += 10;
      hypertensionRisk += 10;
    }

    // Cap at 100
    cardiovascularRisk = Math.min(cardiovascularRisk, 100);
    diabetesRisk = Math.min(diabetesRisk, 100);
    hypertensionRisk = Math.min(hypertensionRisk, 100);

    const overallRisk = Math.round(
      (cardiovascularRisk + diabetesRisk + hypertensionRisk) / 3
    );

    const recommendations = this.generateRecommendations(overallRisk, {
      cardiovascularRisk,
      diabetesRisk,
      hypertensionRisk,
    });

    return {
      overallRisk,
      cardiovascularRisk,
      diabetesRisk,
      hypertensionRisk,
      recommendations,
      lastUpdated: new Date(),
    };
  }

  private generateRecommendations(overallRisk: number, risks: any): string[] {
    const recommendations: string[] = [];

    if (overallRisk < 30) {
      recommendations.push('Great job! Continue your healthy lifestyle');
      recommendations.push('Schedule annual check-ups');
    } else if (overallRisk < 60) {
      recommendations.push('Consider lifestyle modifications');
      recommendations.push('Increase physical activity to 150 minutes/week');
      recommendations.push('Focus on a heart-healthy diet');
    } else {
      recommendations.push('Consult with your healthcare provider immediately');
      recommendations.push('Consider medication management');
      recommendations.push('Implement strict dietary changes');
    }

    if (risks.cardiovascularRisk > 50) {
      recommendations.push('Schedule cardiology consultation');
    }

    if (risks.diabetesRisk > 50) {
      recommendations.push('Monitor blood glucose regularly');
    }

    if (risks.hypertensionRisk > 50) {
      recommendations.push('Monitor blood pressure daily');
    }

    return recommendations;
  }

  getHealthData(): Observable<HealthData | null> {
    return this.healthData$;
  }

  updateHealthMetrics(metrics: Partial<HealthMetrics>): void {
    const currentData = this.healthDataSubject.value;
    if (currentData) {
      const updatedData = {
        ...currentData,
        metrics: { ...currentData.metrics, ...metrics },
      };
      updatedData.riskAssessment = this.calculateRiskScore(
        updatedData.metrics,
        updatedData.lifestyle
      );
      this.healthDataSubject.next(updatedData);
    }
  }

  getClaimsAnalysis(): any {
    const currentData = this.healthDataSubject.value;
    if (!currentData) return null;

    const claims = currentData.claims;
    const totalAmount = claims.reduce((sum, claim) => sum + claim.amount, 0);
    const claimsByType = claims.reduce((acc, claim) => {
      acc[claim.type] = (acc[claim.type] || 0) + claim.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAmount,
      claimsByType,
      claimsCount: claims.length,
      averageClaimAmount: totalAmount / claims.length,
      lastClaimDate: Math.max(...claims.map((c) => c.date.getTime())),
    };
  }
}
