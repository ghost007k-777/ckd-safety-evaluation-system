import React, { useState, useEffect } from 'react';
import { WorkTypeSelection, HeightWorkSubType } from '../types.ts';
import { Card } from './ui/Card.tsx';
import { Checkbox } from './ui/Checkbox.tsx';

interface Step2WorkTypeSelectionProps {
  data: WorkTypeSelection;
  updateData: (field: keyof WorkTypeSelection, value: boolean | HeightWorkSubType) => void;
  onNext: () => void;
}

export const Step2WorkTypeSelection: React.FC<Step2WorkTypeSelectionProps> = ({
  data,
  updateData,
  onNext
}) => {
  const [heightWorkSubType, setHeightWorkSubType] = useState<HeightWorkSubType>(
    data.heightWorkSubType || { ladder: false, scaffold: false, hangingScaffold: false }
  );

  const workTypes = [
    { key: 'general' as const, label: '일반작업', description: '기본적인 건설 및 유지보수 작업' },
    { key: 'confined' as const, label: '밀폐공간작업', description: '탱크, 맨홀, 지하공간 등에서의 작업' },
    { key: 'heightWork' as const, label: '고소작업', description: '2m 이상 높이에서의 작업' },
    { key: 'hotWork' as const, label: '화기작업', description: '용접, 절단, 연삭 등 화기를 사용하는 작업' }
  ];

  const heightWorkSubTypes = [
    { key: 'ladder' as const, label: '사다리, 작업발판', description: '이동식 사다리 및 작업발판을 이용한 작업' },
    { key: 'scaffold' as const, label: '틀비계', description: '강관 틀비계를 이용한 작업' },
    { key: 'hangingScaffold' as const, label: '달비계', description: '로프 등으로 매단 비계를 이용한 작업' }
  ];

  // 고소작업 체크 해제 시 하위 유형도 모두 해제
  useEffect(() => {
    if (!data.heightWork) {
      setHeightWorkSubType({ ladder: false, scaffold: false, hangingScaffold: false });
      updateData('heightWorkSubType' as any, { ladder: false, scaffold: false, hangingScaffold: false });
    }
  }, [data.heightWork]);

  const hasSelection = Object.values(data).some((value, index) => {
    const keys = Object.keys(data);
    const key = keys[index];
    if (key === 'heightWorkSubType') return false;
    return value === true;
  });

  const hasHeightWorkSubTypeSelection = data.heightWork &&
    (heightWorkSubType.ladder || heightWorkSubType.scaffold || heightWorkSubType.hangingScaffold);

  const canProceed = hasSelection && (!data.heightWork || hasHeightWorkSubTypeSelection);

  const handleCheckboxChange = (field: keyof WorkTypeSelection) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData(field, e.target.checked);
  };

  const handleHeightWorkSubTypeChange = (field: keyof HeightWorkSubType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubType = { ...heightWorkSubType, [field]: e.target.checked };
    setHeightWorkSubType(newSubType);
    updateData('heightWorkSubType' as any, newSubType);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <div className="hidden sm:block w-24 h-24 flex-shrink-0">
          <img
            src="/assets/tools.png"
            alt="Work Tools"
            className="w-full h-full object-contain filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">작업 유형 선택</h2>
          <p className="text-slate-500 text-lg">
            해당하는 작업 유형을 모두 선택해주세요.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workTypes.map(({ key, label, description }) => (
              <div
                key={key}
                className={`
                  relative border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer
                  hover:shadow-md
                  ${data[key]
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                  }
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Checkbox
                      id={`work-type-${key}`}
                      label=""
                      checked={data[key]}
                      onChange={handleCheckboxChange(key)}
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor={`work-type-${key}`}
                      className={`block text-lg font-bold mb-1 cursor-pointer ${data[key] ? 'text-blue-700' : 'text-slate-700'}`}
                    >
                      {label}
                    </label>
                    <p className="text-sm text-slate-500 font-medium">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 고소작업 하위 유형 선택 */}
          {data.heightWork && (
            <div className="p-8 border border-indigo-100 bg-indigo-50/50 rounded-2xl animate-fadeIn">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                고소작업 세부 유형 선택
              </h3>
              <p className="text-sm text-indigo-600 mb-6 font-medium">
                해당하는 고소작업 유형을 선택해주세요. (복수 선택 가능)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {heightWorkSubTypes.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className={`
                      bg-white border rounded-xl p-5 transition-all duration-200
                      ${heightWorkSubType[key]
                        ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'border-indigo-100 hover:border-indigo-300'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <Checkbox
                          id={`height-subtype-${key}`}
                          label=""
                          checked={heightWorkSubType[key]}
                          onChange={handleHeightWorkSubTypeChange(key)}
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor={`height-subtype-${key}`}
                          className="block font-bold text-slate-800 cursor-pointer mb-1"
                        >
                          {label}
                        </label>
                        <p className="text-xs text-slate-500 font-medium">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!hasHeightWorkSubTypeSelection && (
                <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-lg flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  고소작업 세부 유형을 최소 1개 이상 선택해주세요.
                </div>
              )}
            </div>
          )}

          {hasSelection && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex-1 mr-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Selected Types</h3>
                <div className="flex flex-wrap gap-2">
                  {workTypes
                    .filter(({ key }) => data[key])
                    .map(({ key, label }) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full shadow-sm"
                      >
                        {label}
                      </span>
                    ))}
                  {data.heightWork && hasHeightWorkSubTypeSelection &&
                    heightWorkSubTypes
                      .filter(({ key }) => heightWorkSubType[key])
                      .map(({ key, label }) => (
                        <span
                          key={key}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full shadow-sm"
                        >
                          {label}
                        </span>
                      ))
                  }
                </div>
              </div>
              <button
                onClick={onNext}
                disabled={!canProceed}
                className={`
                  px-8 py-4 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1
                  flex items-center gap-2
                  ${canProceed
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }
                `}
              >
                <span>교육 시작</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}

          {!hasSelection && (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500 font-medium border border-slate-200 border-dashed">
              작업 유형을 선택하면 다음 단계로 진행할 수 있습니다.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
