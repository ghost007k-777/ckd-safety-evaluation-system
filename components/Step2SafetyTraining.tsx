import React from 'react';
import { SafetyTraining } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Checkbox } from './ui/Checkbox.tsx';

interface Step2Props {
  data: SafetyTraining;
  updateData: (field: keyof SafetyTraining, value: boolean | Date | null) => void;
}

export const Step2SafetyTraining: React.FC<Step2Props> = ({ data, updateData }) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    updateData('completed', isChecked);
    updateData('completionDate', isChecked ? new Date() : null);
  };

  return (
    <Card>
      <CardHeader
        title="안전 교육"
        description="안전 교육 영상을 시청하고 이수 여부를 확인해주세요."
      />
      <div className="space-y-8">
        <div className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">안전 교육 영상이 여기에 표시됩니다.</p>
        </div>
        <div className="p-6 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg">
          <Checkbox
            id="training-completed"
            label="안전 교육을 이수하였습니다."
            checked={data.completed}
            onChange={handleCheckboxChange}
          />
        </div>
        {data.completionDate && (
          <p className="text-sm text-emerald-700 font-medium">
            교육 이수일: {data.completionDate.toLocaleString('ko-KR')}
          </p>
        )}
      </div>
    </Card>
  );
};