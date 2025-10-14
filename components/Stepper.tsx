import React from 'react';
import { Step } from '../types.ts';

interface StepperProps {
  currentStep: Step;
}

const steps = [
  { id: Step.ProjectInfo, name: '프로젝트 정보' },
  { id: Step.WorkTypeSelection, name: '작업 유형' },
  { id: Step.SafetyTraining, name: '안전 교육' },
  { id: Step.RiskAssessment, name: '위험성 평가' },
  { id: Step.WorkPermit, name: '작업 허가' },
  { id: Step.SafetyPledge, name: '안전 서약' },
  { id: Step.Confirmation, name: '확인' },
];

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);


export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex justify-between items-center w-full">
        {steps.map((step, stepIdx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.name} className="relative flex-1">
              <div className="flex items-center text-sm font-medium">
                {/* Line (KRDS 스타일) */}
                {stepIdx > 0 && (
                  <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-full h-1 transition-colors duration-300 ${
                      isCompleted || isCurrent ? 'bg-[#0066CC]' : 'bg-[#DEE2E6]'
                    }`} 
                    aria-hidden="true" 
                  />
                )}

                {/* Circle (KRDS 스타일) */}
                <div 
                  className={`
                    relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full 
                    flex items-center justify-center 
                    transition-all duration-300
                    ${isCompleted 
                      ? 'bg-[#0066CC] shadow-md' 
                      : isCurrent 
                        ? 'border-[3px] border-[#0066CC] bg-white shadow-lg scale-110' 
                        : 'border-2 border-[#ADB5BD] bg-white'
                    }
                  `}
                >
                    {isCompleted ? (
                      <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : isCurrent ? (
                      <div className="w-2.5 h-2.5 bg-[#0066CC] rounded-full animate-pulse" />
                    ) : null}
                </div>
                
                {/* Text (KRDS 스타일) */}
                <span 
                  className={`
                    absolute top-10 sm:top-11 left-1/2 -translate-x-1/2 
                    text-center text-[10px] sm:text-xs 
                    whitespace-nowrap
                    transition-all duration-200
                    ${isCurrent 
                      ? 'text-[#0066CC] font-bold scale-105' 
                      : isCompleted
                        ? 'text-[#495057] font-medium'
                        : 'text-[#6C757D]'
                    }
                  `}
                >
                    {step.name}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};