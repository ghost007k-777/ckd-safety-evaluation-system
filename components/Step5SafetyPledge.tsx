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
    const allChecked = Object.values(PLEDGE_ITEMS).every((_, index) => newAgreements[`item${index + 1}`]);
    updateData({ agreements: newAgreements, agreeToAll: allChecked });
  };

  const handleAgreeAll = () => {
    const newAgreeToAll = !data.agreeToAll;
    const newAgreements: { [key: string]: boolean } = {};
    Object.keys(PLEDGE_ITEMS).forEach(key => {
      newAgreements[key] = newAgreeToAll;
    });
    updateData({ agreements: newAgreements, agreeToAll: newAgreeToAll });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <div className="hidden sm:block w-24 h-24 flex-shrink-0">
          <img
            src="/assets/pledge.png"
            alt="Safety Pledge"
            className="w-full h-full object-contain filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300 mix-blend-multiply"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">안전 서약</h2>
          <p className="text-slate-500 text-lg">
            안전 수칙 준수를 위한 서약을 진행해주세요.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="p-8 space-y-8">
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                안전 준수 서약서
              </h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="agree-all"
                  label="전체 동의"
                  checked={data.agreeToAll}
                  onChange={handleAgreeAll}
                  className="font-bold text-blue-700"
                />
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(PLEDGE_ITEMS).map(([key, text], index) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                >
                  <Checkbox
                    id={key}
                    label=""
                    checked={data.agreements[key]}
                    onChange={() => handleCheckChange(key)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={key}
                    className="text-slate-700 leading-relaxed cursor-pointer select-none flex-1"
                  >
                    <span className="font-bold text-blue-500 mr-2">{index + 1}.</span>
                    {text}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-slate-400 rounded-full"></span>
              서명
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">서약자 성명</label>
                <Input
                  id="pledge-name"
                  label=""
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                  placeholder="성명을 입력하세요"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">서명</label>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-[160px]">
                  <SignaturePad
                    onEnd={(signature) => updateData({ signature })}
                    signatureDataUrl={data.signature}
                  />
                </div>
                <p className="text-xs text-slate-400 text-right">* 위 영역에 서명해주세요.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step5SafetyPledge;
