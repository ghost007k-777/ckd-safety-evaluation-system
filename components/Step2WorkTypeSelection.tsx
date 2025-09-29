import React from 'react';
import { WorkTypeSelection } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Checkbox } from './ui/Checkbox.tsx';

interface Step2WorkTypeSelectionProps {
  data: WorkTypeSelection;
  updateData: (field: keyof WorkTypeSelection, value: boolean) => void;
  onNext: () => void;
}

export const Step2WorkTypeSelection: React.FC<Step2WorkTypeSelectionProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const workTypes = [
    { key: 'general' as const, label: '일반작업', description: '기본적인 건설 및 유지보수 작업' },
    { key: 'confined' as const, label: '밀폐공간작업', description: '탱크, 맨홀, 지하공간 등에서의 작업' },
    { key: 'heightWork' as const, label: '고소작업', description: '2m 이상 높이에서의 작업' },
    { key: 'hotWork' as const, label: '화기작업', description: '용접, 절단, 연삭 등 화기를 사용하는 작업' }
  ];

  const hasSelection = Object.values(data).some(value => value);

  const handleCheckboxChange = (field: keyof WorkTypeSelection) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData(field, e.target.checked);
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
                <p className="text-sm text-indigo-700 mt-2">
                  선택하신 작업 유형에 대한 안전교육을 순차적으로 진행합니다.
                </p>
              </div>
              <button
                onClick={onNext}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
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
