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

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);


export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Progress" className="mb-10 px-4">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 rounded-full -z-10"></div>

        {/* Active Progress Bar */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full -z-10 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        <ol role="list" className="flex justify-between items-start w-full">
          {steps.map((step, stepIdx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <li key={step.name} className="relative flex flex-col items-center group cursor-default">
                <div className="flex items-center justify-center relative">
                  {/* Circle */}
                  <div
                    className={`
                      relative z-10 w-10 h-10 rounded-full 
                      flex items-center justify-center 
                      transition-all duration-500
                      ${isCompleted
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'
                        : isCurrent
                          ? 'bg-white border-[3px] border-blue-600 shadow-xl shadow-blue-500/20 scale-110'
                          : 'bg-white border-2 border-slate-300'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5 text-white" />
                    ) : isCurrent ? (
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">{step.id}</span>
                    )}
                  </div>
                </div>

                {/* Text */}
                <span
                  className={`
                    absolute top-12 w-24 text-center text-[10px] sm:text-xs font-bold tracking-tight
                    transition-all duration-300
                    ${isCurrent
                      ? 'text-blue-700 -translate-y-1 opacity-100'
                      : isCompleted
                        ? 'text-slate-600 opacity-80'
                        : 'text-slate-400 opacity-60'
                    }
                  `}
                >
                  {step.name}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};