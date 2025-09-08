import React from 'react';
import { SafetyPledge } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Checkbox } from './ui/Checkbox.tsx';
import { Input } from './ui/Input.tsx';
import { SignaturePad } from './SignaturePad.tsx';
import { PLEDGE_ITEMS } from '../constants.ts';

interface Step5Props {
  data: SafetyPledge;
  updateData: (data: Partial<SafetyPledge>) => void;
}

const Step5SafetyPledge: React.FC<Step5Props> = ({ data, updateData }) => {
  const handleCheckChange = (key: string) => {
    const newAgreements = { ...data.agreements, [key]: !data.agreements[key] };
    const allChecked = Object.values(PLEDGE_ITEMS).every((_, index) => newAgreements[`item${index+1}`]);
    updateData({ agreements: newAgreements, agreeToAll: allChecked });
  };

  const handleAgreeToAllChange = () => {
    const newAgreeToAll = !data.agreeToAll;
    const newAgreements: { [key: string]: boolean } = {};
    Object.keys(PLEDGE_ITEMS).forEach(key => {
      newAgreements[key] = newAgreeToAll;
    });
    updateData({ agreements: newAgreements, agreeToAll: newAgreeToAll });
  };
  
  return (
    <Card>
      <CardHeader
        title="안전보건 준수 서약서"
        description="아래의 안전 준수 항목을 읽고 동의해주세요."
      />
      <div className="space-y-8">
        <div className="p-6 border rounded-xl space-y-4 bg-gray-50">
          {Object.entries(PLEDGE_ITEMS).map(([key, text]) => (
            <Checkbox 
              key={key} 
              id={key} 
              label={text} 
              checked={!!data.agreements[key]}
              onChange={() => handleCheckChange(key)}
            />
          ))}
        </div>
        <div className="p-6 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg">
          <Checkbox 
            id="agree-to-all"
            label="상기 내용 전체 동의"
            checked={data.agreeToAll}
            onChange={handleAgreeToAllChange}
          />
        </div>
        <p className="text-sm text-red-600 font-medium p-4 border border-red-200 bg-red-50 rounded-lg">본인은 교육내용에 대해 충분히 이해하였으며 모두 준수할 것을 동의합니다. 상기 사항 관련 문제 발생 시 본인이 모든 책임을 질 것을 동의합니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <Input 
              label="성명"
              type="text"
              value={data.name}
              onChange={e => updateData({ name: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">서명</label>
              <SignaturePad onEnd={(sig) => updateData({ signature: sig })} signatureDataUrl={data.signature} />
            </div>
        </div>
      </div>
    </Card>
  );
};

export default Step5SafetyPledge;
