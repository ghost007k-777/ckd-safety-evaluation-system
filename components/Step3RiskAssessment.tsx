import React from 'react';
import { RiskAssessment, RiskItem } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { DISASTER_TYPES } from '../constants.ts';
import { generateUniqueId } from '../utils.ts';

interface Step3Props {
  data: RiskAssessment;
  setData: (data: RiskAssessment) => void;
}

const RiskRow: React.FC<{ item: RiskItem; onUpdate: (item: RiskItem) => void; onRemove: (id: string) => void }> = ({ item, onUpdate, onRemove }) => {
  const riskScore = item.likelihood * item.severity;
  const riskColor = riskScore >= 9 ? 'bg-rose-50' : riskScore >= 4 ? 'bg-amber-50' : 'bg-emerald-50';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 border p-6 rounded-xl ${riskColor}`}>
      <Input label="장소명(공정명)" value={item.location} onChange={e => onUpdate({ ...item, location: e.target.value })} />
      <Input label="세부작업명" value={item.task} onChange={e => onUpdate({ ...item, task: e.target.value })} />
      <div className="md:col-span-2">
        <Input label="유해·위험요인" value={item.hazard} onChange={e => onUpdate({ ...item, hazard: e.target.value })} />
      </div>
       <Select label="재해유형분류" value={item.disasterType} onChange={e => onUpdate({ ...item, disasterType: e.target.value })}>
          <option value="">유형 선택</option>
          {DISASTER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
      </Select>
      <div className="md:col-span-2">
         <Input label="현재 안전보건조치" value={item.safetyMeasures} onChange={e => onUpdate({ ...item, safetyMeasures: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">가능성 (1-5)</label>
          <input type="number" min="1" max="5" value={item.likelihood} onChange={e => onUpdate({ ...item, likelihood: parseInt(e.target.value) || 1 })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">중대성 (1-4)</label>
          <input type="number" min="1" max="4" value={item.severity} onChange={e => {
              const val = Math.max(1, Math.min(4, parseInt(e.target.value, 10) || 1));
              onUpdate({ ...item, severity: val });
            }} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900" />
        </div>
        <div className="text-center p-3 rounded-lg bg-white border">
          <div className="text-sm text-gray-500">위험성</div>
          <div className="font-bold text-xl">{riskScore}</div>
        </div>
      </div>
      <div className="md:col-span-2">
        <Input label="위험성 감소대책" value={item.reductionMeasures} onChange={e => onUpdate({ ...item, reductionMeasures: e.target.value })} />
      </div>
      <div className="md:col-span-2 text-right">
        <Button variant="danger" onClick={() => onRemove(item.id)} className="px-4 py-2">삭제</Button>
      </div>
    </div>
  );
};

const Step3RiskAssessment: React.FC<Step3Props> = ({ data, setData }) => {

  const addRow = () => {
    setData([
      ...data,
      {
        id: generateUniqueId(),
        location: '', task: '', disasterType: '', hazard: '', safetyMeasures: '',
        likelihood: 1, severity: 1, reductionMeasures: ''
      }
    ]);
  };

  const updateRow = (updatedItem: RiskItem) => {
    setData(data.map(item => item.id === updatedItem.id ? updatedItem : item));
  };
  
  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  return (
    <Card>
      <CardHeader
        title={
          <span>
            위험성평가
            <span className="text-sm ml-1">(최소 1건 이상 작성)</span>
          </span>
        }
        description="잠재적 위험 요소를 식별하고 완화 조치를 작성합니다."
      />
      
      <div className="space-y-8">
        {data.map(item => <RiskRow key={item.id} item={item} onUpdate={updateRow} onRemove={removeRow} />)}
        <Button onClick={addRow}>위험 항목 추가</Button>
      </div>
    </Card>
  );
};

export default Step3RiskAssessment;