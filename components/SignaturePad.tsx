import React, { useRef, useEffect } from 'react';
import SignatureCanvasModule from 'react-signature-canvas';
import { Button } from './ui/Button.tsx';

// ESM 모듈 호환성을 위한 처리
const SignatureCanvas = (SignatureCanvasModule as any).default || SignatureCanvasModule;

interface SignaturePadProps {
  onEnd: (signature: string) => void;
  signatureDataUrl: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onEnd, signatureDataUrl }) => {
  // FIX: 'SignatureCanvas' is a value, but was being used as a type.
  // `InstanceType<typeof SignatureCanvas>` is used to get the correct instance type for the ref.
  const sigCanvas = useRef<InstanceType<typeof SignatureCanvas>>(null);

  // FIX: The 'penColor' prop causes a TypeScript error due to incorrect type definitions.
  // Set the pen color programmatically after the component mounts to work around this issue.
  useEffect(() => {
    if (sigCanvas.current) {
      // The getSignaturePad method might also be missing from faulty type definitions, so we use 'as any'.
      const signaturePad = (sigCanvas.current as any).getSignaturePad();
      signaturePad.penColor = 'black';
    }
  }, []);

  // 서명 데이터가 있을 때 캔버스에 복원
  useEffect(() => {
    if (sigCanvas.current && signatureDataUrl) {
      sigCanvas.current.fromDataURL(signatureDataUrl);
    }
  }, [signatureDataUrl]);

  const clear = () => {
    sigCanvas.current?.clear();
    onEnd('');
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      onEnd(sigCanvas.current.toDataURL('image/png'));
    }
  };

  return (
    <div>
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-slate-50">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{ className: 'w-full h-48' }}
          onEnd={handleEnd}
        />
      </div>
      <div className="mt-3 text-right">
        <Button type="button" variant="secondary" onClick={clear} disabled={!signatureDataUrl} className="px-4 py-2">
          서명 지우기
        </Button>
      </div>
    </div>
  );
};