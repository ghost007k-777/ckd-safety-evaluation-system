import React from 'react';
import { Step } from '../types.ts';

interface StepperProps {
  currentStep: Step;
}

const steps = [
  { id: Step.ProjectInfo, name: '프로젝트 정보' },
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
    <nav aria-label="Progress">
      <ol role="list" className="flex justify-between items-center w-full">
        {steps.map((step, stepIdx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.name} className="relative flex-1">
              <div className="flex items-center text-sm font-medium">
                {/* Line */}
                {stepIdx > 0 && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-full h-0.5 ${isCompleted || isCurrent ? 'bg-indigo-600' : 'bg-gray-300'}`} aria-hidden="true" />
                )}

                {/* Circle */}
                <div className={`relative w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-indigo-600' : isCurrent ? 'border-2 border-indigo-600 bg-white' : 'border-2 border-gray-300 bg-white'}`}>
                    {isCompleted ? <CheckIcon className="w-4 h-4 text-white" /> : isCurrent ? <div className="w-2 h-2 bg-indigo-600 rounded-full" /> : null}
                </div>
                
                {/* Text */}
                <span className={`absolute top-9 left-1/2 -translate-x-1/2 text-center text-[11px] sm:text-xs ${isCurrent ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
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