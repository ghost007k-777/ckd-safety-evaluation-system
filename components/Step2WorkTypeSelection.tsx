import React, { useState, useEffect } from 'react';
import { WorkTypeSelection, HeightWorkSubType } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
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
    <Card>
      <CardHeader
        title="작업 유형 선택"
        description="해당하는 작업 유형을 모두 선택해주세요. 선택한 유형에 대한 안전교육을 진행합니다."
      />
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workTypes.map(({ key, label, description }) => (
            <div key={key} className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
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
                    className="block text-lg font-semibold text-gray-900 cursor-pointer"
                  >
                    {label}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 고소작업 하위 유형 선택 */}
        {data.heightWork && (
          <div className="p-6 border-2 border-indigo-200 bg-indigo-50 rounded-xl">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">
              고소작업 세부 유형 선택
            </h3>
            <p className="text-sm text-indigo-700 mb-4">
              해당하는 고소작업 유형을 선택해주세요. (복수 선택 가능)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {heightWorkSubTypes.map(({ key, label, description }) => (
                <div key={key} className="bg-white border border-indigo-200 rounded-lg p-4 hover:border-indigo-400 transition-colors">
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
                        className="block font-semibold text-gray-900 cursor-pointer"
                      >
                        {label}
                      </label>
                      <p className="text-xs text-gray-600 mt-1">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!hasHeightWorkSubTypeSelection && (
              <div className="mt-4 p-3 border border-amber-300 bg-amber-50 rounded-lg">
                <p className="text-amber-800 text-sm text-center">
                  ⚠️ 고소작업 세부 유형을 최소 1개 이상 선택해주세요.
                </p>
              </div>
            )}
          </div>
        )}

        {hasSelection && (
          <div className="p-6 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">선택된 작업 유형</h3>
                <div className="flex flex-wrap gap-2">
                  {workTypes
                    .filter(({ key }) => data[key])
                    .map(({ key, label }) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                </div>
                {data.heightWork && hasHeightWorkSubTypeSelection && (
                  <div className="mt-2 pl-4">
                    <p className="text-xs text-indigo-600 mb-1">고소작업 세부 유형:</p>
                    <div className="flex flex-wrap gap-2">
                      {heightWorkSubTypes
                        .filter(({ key }) => heightWorkSubType[key])
                        .map(({ key, label }) => (
                          <span
                            key={key}
                            className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200"
                          >
                            {label}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-indigo-700 mt-2">
                  선택하신 작업 유형에 대한 안전교육을 순차적으로 진행합니다.
                </p>
              </div>
              <button
                onClick={onNext}
                disabled={!canProceed}
                className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                  canProceed 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                교육 시작
              </button>
            </div>
          </div>
        )}

        {!hasSelection && (
          <div className="p-6 border border-amber-200 bg-amber-50 rounded-lg">
            <p className="text-amber-800 text-center">
              ⚠️ 하나 이상의 작업 유형을 선택해주세요.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
