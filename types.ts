export enum Step {
  ProjectInfo = 1,
  WorkTypeSelection = 2,
  SafetyTraining = 3,
  RiskAssessment = 4,
  WorkPermit = 5,
  SafetyPledge = 6,
  Confirmation = 7,
  Submitted = 8,
}

export interface ProjectInfo {
  location: string;
  locationOther?: string;
  constructionName: string;
  companyName: string;
  contactPerson: string;
}

export interface WorkTypeSelection {
  general: boolean;
  confined: boolean;
  heightWork: boolean;
  hotWork: boolean;
}

export interface SafetyTraining {
  completed: boolean;
  completionDate: Date | null;
  workTypes: WorkTypeSelection;
  currentVideoIndex: number;
  allVideosCompleted: boolean;
}

export interface RiskItem {
  id: string;
  location: string;
  task: string;
  disasterType: string;
  hazard: string;
  safetyMeasures: string;
  likelihood: number;
  severity: number;
  reductionMeasures: string;
}

export type RiskAssessment = RiskItem[];

export interface SafetyCheckItem {
  id: string;
  category: '일반항목' | '고소작업';
  text: string;
  applicable: 'O' | 'X' | '';
  implemented: 'O' | 'X' | '';
}

export interface HazardousSafetyCheckItem {
  id: string;
  category: '일반항목' | '화기작업' | '고소작업';
  text: string;
  applicable: 'O' | 'X' | '';
  implemented: 'O' | 'X' | '';
}

export interface ConfinedSpaceSafetyCheckItem {
  id: string;
  text: string;
  applicable: '유' | '무' | '';
  confirmed: boolean;
}

export interface GasMeasurement {
  id: string;
  name: string;
  concentration: string;
  time: string;
}

export interface WorkerInfo {
  id: string;
  name: string;
  phoneNumber: string;
  role?: '관리감독자' | '감시인' | '작업자';
}


export interface WorkPermit {
  type: 'general' | 'hazardous' | 'confined' | '';
  
  // common fields for both types
  workDate: string;
  workStartTime: string;
  workEndTime: string;
  location: string;
  description: string;
  workerCount: number;
  workers?: WorkerInfo[];
  applicantTeam?: string;
  applicantName?: string;
  applicantSignature?: string;
  managerTeam?: string;
  managerName?: string;
  managerSignature?: string;
  procedureDocStatus?: 'yes' | 'no' | '';
  riskAssessmentStatus?: 'yes' | 'no' | '';
  isHighAltitudeWork?: 'yes' | 'no' | '';
  specialNotes?: string;

  // Fields for 'general' type
  safetyCheckList?: SafetyCheckItem[];
  
  // Fields for 'hazardous' type
  isHotWork?: 'yes' | 'no' | '';
  hazardousSafetyCheckList?: HazardousSafetyCheckItem[];
  gasMeasurements?: GasMeasurement[];
  
  // Fields for 'confined' type
  confinedSpaceSafetyCheckList?: ConfinedSpaceSafetyCheckItem[];
}


export interface SafetyPledge {
  agreements: { [key: string]: boolean };
  agreeToAll: boolean;
  name: string;
  signature: string;
}

export interface FormData {
  projectInfo: ProjectInfo;
  workTypeSelection: WorkTypeSelection;
  safetyTraining: SafetyTraining;
  riskAssessment: RiskAssessment;
  workPermit: WorkPermit;
  safetyPledge: SafetyPledge;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalInfo {
  safetyManagerApproval?: {
    approved: boolean;
    approverName: string;
    approvedAt: Date;
  };
  departmentManagerApproval?: {
    approved: boolean;
    approverName: string;
    approvedAt: Date;
  };
}

export interface Submission extends FormData {
  id: string;
  status: SubmissionStatus;
  submittedAt: Date;
  approvalInfo?: ApprovalInfo;
  rejectionReason?: string;
}