import React, { useState, useCallback } from 'react';
import { Step, FormData, ProjectInfo, WorkTypeSelection, SafetyTraining, RiskAssessment, WorkPermit, SafetyPledge, HeightWorkSubType, Submission, TrainingAttendee } from './types.ts';
import { Stepper } from './components/Stepper.tsx';
import { Button } from './components/ui/Button.tsx';
import { Step1ProjectInfo } from './components/Step1ProjectInfo.tsx';
import { Step2WorkTypeSelection } from './components/Step2WorkTypeSelection.tsx';
import { Step2SafetyTraining } from './components/Step2SafetyTraining.tsx';
import Step3RiskAssessment from './components/Step3RiskAssessment.tsx';
import Step4WorkPermit from './components/Step4WorkPermit.tsx';
import Step5SafetyPledge from './components/Step5SafetyPledge.tsx';
import Step6Confirmation from './components/Step6Confirmation.tsx';
import { SAFETY_CHECK_LIST_ITEMS, HAZARDOUS_SAFETY_CHECK_ITEMS, CONFINED_SPACE_SAFETY_CHECK_ITEMS } from './constants.ts';
import { Card } from './components/ui/Card.tsx';
import { generateUniqueId } from './utils.ts';


interface EvaluationFormProps {
    onBackToHome: () => void;
    onSubmit: (formData: FormData) => void;
    onViewList: () => void;
    initialData?: Submission;
    isEditMode?: boolean;
}

interface ValidationResult {
    isValid: boolean;
    message: string;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({onBackToHome, onSubmit, onViewList, initialData, isEditMode = false}) => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.ProjectInfo);
  
  const [formData, setFormData] = useState<FormData>(() => {
    // 수정 모드일 경우 initialData를 사용
    if (initialData) {
      return {
        projectInfo: initialData.projectInfo,
        workTypeSelection: initialData.workTypeSelection,
        safetyTraining: initialData.safetyTraining,
        riskAssessment: initialData.riskAssessment,
        workPermit: initialData.workPermit,
        safetyPledge: initialData.safetyPledge
      };
    }

    // 새 신청일 경우 기본값
    const initialFormData: FormData = {
      projectInfo: { location: '', locationOther: '', constructionName: '', companyName: '', contactPerson: '' },
      workTypeSelection: { general: false, confined: false, heightWork: false, hotWork: false },
      safetyTraining: { 
        completed: false, 
        completionDate: null,
        workTypes: { general: false, confined: false, heightWork: false, hotWork: false },
        currentVideoIndex: 0,
        allVideosCompleted: false,
        attendees: []
      },
      riskAssessment: [],
      workPermit: { 
        type: '', 
        workDate: '', workStartTime: '', workEndTime: '', 
        location: '', description: '', workerCount: 3,
        workers: [
          { id: generateUniqueId(), name: '', phoneNumber: '', role: '관리감독자' },
          { id: generateUniqueId(), name: '', phoneNumber: '', role: '감시인' },
          { id: generateUniqueId(), name: '', phoneNumber: '', role: '작업자' }
        ], // 밀폐공간작업 기본: 관리감독자, 감시인, 작업자 1명
        // Common fields
        applicantTeam: '', applicantName: '', applicantSignature: '',
        managerTeam: '', managerName: '', managerSignature: '',
        procedureDocStatus: '', riskAssessmentStatus: '',
        specialNotes: '',
        isHighAltitudeWork: '',
        // General type fields
        safetyCheckList: SAFETY_CHECK_LIST_ITEMS.map(item => ({ ...item, applicable: '', implemented: '' })) as any,
        // Hazardous type fields
        isHotWork: '',
        hazardousSafetyCheckList: HAZARDOUS_SAFETY_CHECK_ITEMS.map(item => ({...item, applicable: '', implemented: ''})) as any,
        gasMeasurements: [{id: generateUniqueId(), name: '', concentration: '', time: ''}],
        // Confined space type fields
        confinedSpaceSafetyCheckList: CONFINED_SPACE_SAFETY_CHECK_ITEMS.map(item => ({...item, applicable: '', confirmed: false})),
      },
      safetyPledge: { agreements: {}, agreeToAll: false, name: '', signature: '' }
    };
    return initialFormData;
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const updateProjectInfo = useCallback((field: keyof ProjectInfo, value: string) => {
    setValidationError(null);
    setFormData(prev => ({ ...prev, projectInfo: { ...prev.projectInfo, [field]: value } }));
  }, []);

  const updateWorkTypeSelection = useCallback((field: keyof WorkTypeSelection, value: boolean | HeightWorkSubType) => {
    setValidationError(null);
    setFormData(prev => ({ 
      ...prev, 
      workTypeSelection: { ...prev.workTypeSelection, [field]: value },
      safetyTraining: { ...prev.safetyTraining, workTypes: { ...prev.safetyTraining.workTypes, [field]: value } }
    }));
  }, []);

  const updateSafetyTraining = useCallback((field: keyof SafetyTraining, value: boolean | Date | null | number | TrainingAttendee[]) => {
    setValidationError(null);
    setFormData(prev => ({ ...prev, safetyTraining: { ...prev.safetyTraining, [field]: value } }));
  }, []);
  
  const setRiskAssessment = useCallback((data: RiskAssessment) => {
    setValidationError(null);
    setFormData(prev => ({ ...prev, riskAssessment: data }));
  }, []);

  const updateWorkPermit = useCallback((data: Partial<WorkPermit>) => {
    setValidationError(null);
    setFormData(prev => ({ ...prev, workPermit: { ...prev.workPermit, ...data }}));
  }, []);

  const updateSafetyPledge = useCallback((data: Partial<SafetyPledge>) => {
    setValidationError(null);
    setFormData(prev => ({...prev, safetyPledge: { ...prev.safetyPledge, ...data }}));
  }, []);

  const getValidationResult = (): ValidationResult => {
    switch (currentStep) {
        case Step.ProjectInfo: {
            const { location, locationOther, constructionName, companyName, contactPerson } = formData.projectInfo;
            if (!location) return { isValid: false, message: '공사 위치를 선택해주세요.' };
            if (location === '기타' && !locationOther) return { isValid: false, message: '기타 공사 위치를 입력해주세요.' };
            if (!constructionName) return { isValid: false, message: '공사명을 입력해주세요.' };
            if (!companyName) return { isValid: false, message: '업체명을 입력해주세요.' };
            if (!contactPerson) return { isValid: false, message: '담당자 성명을 입력해주세요.' };
            return { isValid: true, message: '' };
        }
        case Step.WorkTypeSelection: {
            const { general, confined, heightWork, hotWork, heightWorkSubType } = formData.workTypeSelection;
            if (!general && !confined && !heightWork && !hotWork) {
                return { isValid: false, message: '하나 이상의 작업 유형을 선택해주세요.' };
            }
            // 고소작업이 선택되었을 때 하위 유형 확인
            if (heightWork) {
                if (!heightWorkSubType || (!heightWorkSubType.ladder && !heightWorkSubType.scaffold && !heightWorkSubType.hangingScaffold)) {
                    return { isValid: false, message: '고소작업 세부 유형을 최소 1개 이상 선택해주세요.' };
                }
            }
            return { isValid: true, message: '' };
        }
        case Step.SafetyTraining:
            if (!formData.safetyTraining.completed) return { isValid: false, message: '안전 교육 이수를 확인해주세요.' };
            return { isValid: true, message: '' };
        case Step.RiskAssessment:
            const invalidItem = formData.riskAssessment.find(item => {
                const riskScore = item.likelihood * item.severity;
                const isReductionMeasuresRequired = riskScore >= 9 && !item.reductionMeasures;
                return !item.location || !item.task || !item.hazard || !item.disasterType || isReductionMeasuresRequired;
            });
            if (invalidItem) {
                const riskScore = invalidItem.likelihood * invalidItem.severity;
                if (riskScore >= 9 && !invalidItem.reductionMeasures) {
                    return { isValid: false, message: '위험성이 9 이상인 항목은 감소대책을 반드시 입력해야 합니다.' };
                }
                return { isValid: false, message: '모든 위험성 평가 항목의 필수 필드를 채워주세요.' };
            }
            if (formData.riskAssessment.length === 0) return { isValid: false, message: '하나 이상의 위험성 평가 항목을 추가해야 합니다.'};
            return { isValid: true, message: '' };
        case Step.WorkPermit: {
            const { type, workDate, workStartTime, workEndTime, location, description, workerCount, applicantName, applicantSignature, managerName, managerSignature, procedureDocStatus, riskAssessmentStatus } = formData.workPermit;
            if (!type) return { isValid: false, message: '작업 유형을 선택해주세요.' };
            
            const isBaseInfoValid = !!workDate && !!workStartTime && !!workEndTime && !!location && !!description && workerCount > 0;
            if (!isBaseInfoValid) return { isValid: false, message: '작업 허가서의 작업장소, 일시, 내용 등 기본 정보를 모두 입력해주세요.' };
            if (!applicantName || !applicantSignature) return { isValid: false, message: '신청자 성명과 서명을 입력해주세요.'};
            if (!managerName || !managerSignature) return { isValid: false, message: '시행부서 팀장 성명과 서명을 입력해주세요.'};
            if (!procedureDocStatus) return { isValid: false, message: '작업절차서 첨부 여부를 선택해주세요.'};
            if (!riskAssessmentStatus) return { isValid: false, message: '위험성평가 첨부 여부를 선택해주세요.'};

            if (type === 'general') {
                const { isHighAltitudeWork, safetyCheckList } = formData.workPermit;
                if (!isHighAltitudeWork) return { isValid: false, message: '고소작업 해당 여부를 선택해주세요.'};
                
                const checksToValidate = (safetyCheckList ?? []).filter(item => 
                    item.category === '일반항목' || (item.category.startsWith('고소작업') && isHighAltitudeWork === 'yes')
                );
                
                if (checksToValidate.some(item => !item.applicable || !item.implemented)) {
                    return { isValid: false, message: '모든 안전조치 요구사항의 해당/실시 여부를 선택해주세요.' };
                }
            }
            if (type === 'hazardous') {
                const { isHotWork, isHighAltitudeWork, hazardousSafetyCheckList } = formData.workPermit;
                if (!isHotWork) return { isValid: false, message: '화기작업 해당 여부를 선택해주세요.' };
                if (!isHighAltitudeWork) return { isValid: false, message: '고소작업 해당 여부를 선택해주세요.' };

                const checksToValidate = (hazardousSafetyCheckList ?? []).filter(item => 
                    item.category === '일반항목' ||
                    (item.category === '화기작업' && isHotWork === 'yes') ||
                    (item.category.startsWith('고소작업') && isHighAltitudeWork === 'yes')
                );
                
                if (checksToValidate.some(item => !item.applicable || !item.implemented)) {
                     return { isValid: false, message: '모든 안전조치 요구사항의 해당/실시 여부를 선택해주세요.' };
                }
            }
            return { isValid: true, message: '' };
        }
        case Step.SafetyPledge:
            if (!formData.safetyPledge.agreeToAll) return { isValid: false, message: '모든 서약 항목에 동의해야 합니다.'};
            if (!formData.safetyPledge.name) return { isValid: false, message: '성명을 입력해주세요.'};
            if (!formData.safetyPledge.signature) return { isValid: false, message: '서명을 입력해주세요.'};
            return { isValid: true, message: '' };
        case Step.Confirmation:
            return { isValid: true, message: '' };
        default:
            return { isValid: false, message: '알 수 없는 오류입니다.' };
    }
  }


  const handleNext = () => {
    const validation = getValidationResult();
    if (validation.isValid) {
      setValidationError(null);
      setCurrentStep(prev => Math.min(prev + 1, Step.Confirmation));
    } else {
      setValidationError(validation.message);
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    if (currentStep === Step.ProjectInfo) {
      onBackToHome();
    } else {
      setCurrentStep(prev => Math.max(prev - 1, Step.ProjectInfo));
    }
  };
  
  const handleSubmit = () => {
    onSubmit(formData);
    setCurrentStep(Step.Submitted);
  }

  const handleWorkTypeNext = () => {
    console.log('🔄 [EvaluationForm] 작업유형 선택 완료, 안전교육으로 이동');
    console.log('🔄 [EvaluationForm] workTypeSelection:', formData.workTypeSelection);
    console.log('🔄 [EvaluationForm] safetyTraining.workTypes:', formData.safetyTraining.workTypes);
    setCurrentStep(Step.SafetyTraining);
  };

  const handleSafetyTrainingComplete = () => {
    setCurrentStep(Step.RiskAssessment);
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.ProjectInfo:
        return <Step1ProjectInfo data={formData.projectInfo} updateData={updateProjectInfo} />;
      case Step.WorkTypeSelection:
        return <Step2WorkTypeSelection 
          data={formData.workTypeSelection} 
          updateData={updateWorkTypeSelection} 
          onNext={handleWorkTypeNext}
        />;
      case Step.SafetyTraining:
        console.log('🎯 [EvaluationForm] SafetyTraining 렌더링 중');
        console.log('🎯 [EvaluationForm] safetyTraining data:', formData.safetyTraining);
        return <Step2SafetyTraining 
          data={formData.safetyTraining} 
          updateData={updateSafetyTraining} 
          onComplete={handleSafetyTrainingComplete}
        />;
      case Step.RiskAssessment:
        return <Step3RiskAssessment data={formData.riskAssessment} setData={setRiskAssessment} />;
      case Step.WorkPermit:
        return <Step4WorkPermit data={formData.workPermit} updateData={updateWorkPermit} />;
      case Step.SafetyPledge:
        return <Step5SafetyPledge data={formData.safetyPledge} updateData={updateSafetyPledge} />;
      case Step.Confirmation:
        return <Step6Confirmation data={formData} />;
      case Step.Submitted:
        return (
          <Card className="text-center">
            <svg className="mx-auto h-16 w-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-2xl font-semibold text-gray-900">제출 완료</h3>
            <p className="mt-2 text-md text-gray-600">안전 관련 서류가 검토를 위해 제출되었습니다. 결과는 별도로 통보될 것입니다.</p>
            <div className="mt-8">
                <Button onClick={onViewList}>신청 목록 보기</Button>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {currentStep < Step.Submitted && (
          <div className="mb-12">
              <Stepper currentStep={currentStep} />
          </div>
      )}
      
      {renderStep()}

      {currentStep < Step.Submitted && (
        <div className="mt-10">
          {validationError && (
            <p className="text-sm font-medium text-red-600 text-center mb-4">
              {validationError}
            </p>
          )}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:items-center">
            {currentStep !== Step.ProjectInfo && (
              <Button variant="secondary" onClick={handlePrev} className="w-full sm:w-40">
                이전
              </Button>
            )}
            
            <Button variant="ghost" onClick={onBackToHome} className="w-full sm:w-40">
              홈으로
            </Button>

            {currentStep === Step.Confirmation ? (
              <Button onClick={handleSubmit} className="w-full sm:w-40">제출하기</Button>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-40">
                다음
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};