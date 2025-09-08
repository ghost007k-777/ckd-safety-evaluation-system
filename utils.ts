import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Submission } from './types';

export const generateUniqueId = (): string => {
  // Use crypto.randomUUID if available, otherwise fallback to a less robust method.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID (e.g., non-secure contexts http://)
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const downloadSubmissionAsPdf = async (element: HTMLElement, filename: string): Promise<void> => {
  if (!element) {
    console.error("Element to print not found.");
    return;
  }
  
  // 고품질 캔버스 생성
  const canvas = await html2canvas(element, {
    scale: 2, // 고품질을 위한 스케일
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // 여백 설정 (mm 단위)
  const margin = 10;
  const usableWidth = pdfWidth - (margin * 2);
  const usableHeight = pdfHeight - (margin * 2);
  
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  // 이미지가 PDF 페이지 너비에 맞도록 스케일 계산
  const scale = usableWidth / (canvasWidth / 2); // scale 2로 생성했으므로 보정
  const scaledImageWidth = usableWidth;
  const scaledImageHeight = (canvasHeight / 2) * scale; // scale 2로 생성했으므로 보정
  
  // 한 페이지에 들어갈 수 있는 이미지 높이
  const pageImageHeight = usableHeight;
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(scaledImageHeight / pageImageHeight);
  
  console.log(`PDF 생성 정보:
    - 원본 이미지 크기: ${canvasWidth} x ${canvasHeight}px
    - 스케일된 이미지 크기: ${scaledImageWidth} x ${scaledImageHeight}mm
    - 페이지당 이미지 높이: ${pageImageHeight}mm
    - 총 페이지 수: ${totalPages}`);

  // 각 페이지별로 이미지 분할하여 추가
  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage(); // 첫 페이지 이후에는 새 페이지 추가
    }
    
    // 현재 페이지에서 사용할 이미지의 Y 좌표 계산
    const yPosition = -(page * pageImageHeight);
    
    // 마지막 페이지인 경우 남은 높이만 사용
    const currentPageHeight = page === totalPages - 1 
      ? scaledImageHeight - (page * pageImageHeight)
      : pageImageHeight;
    
    // 이미지를 PDF에 추가 (클리핑 영역 적용)
    pdf.addImage(
      imgData, 
      'PNG', 
      margin, // x 위치
      margin + yPosition, // y 위치 (음수로 이미지를 위로 이동)
      scaledImageWidth, // 이미지 너비
      scaledImageHeight, // 이미지 전체 높이
      undefined, // alias
      'MEDIUM' // compression
    );
    
    // 페이지 경계를 넘는 부분을 자르기 위해 클리핑 마스크 적용
    if (yPosition < 0) {
      // 페이지 영역 밖의 내용을 숨기기 위한 흰색 사각형 추가
      pdf.setFillColor(255, 255, 255);
      
      // 상단 마스킹
      if (yPosition < -margin) {
        pdf.rect(0, 0, pdfWidth, margin, 'F');
      }
      
      // 하단 마스킹
      const bottomMaskY = margin + currentPageHeight;
      if (bottomMaskY < pdfHeight - margin) {
        pdf.rect(0, bottomMaskY, pdfWidth, pdfHeight - bottomMaskY, 'F');
      }
    }
  }
  
  // PDF 저장
  pdf.save(filename);
  
  console.log(`PDF 파일 "${filename}" 생성 완료 (${totalPages} 페이지)`);
};

// 엑셀 다운로드 함수 (위험성평가 상세 포함)
export const downloadSubmissionsAsExcel = (submissions: Submission[]): void => {
  // 모든 데이터를 하나의 배열로 변환 (위험항목별로 행 생성)
  const allRows: string[][] = [];
  
  // 헤더 추가
  const headers = [
    '신청ID', '상태', '제출일시', '업체명', '공사명', '위치', '담당자',
    '안전교육완료', '작업허가유형', '서약완료',
    '위험항목번호', '장소명(공정명)', '세부작업명', '유해위험요인', '재해유형분류',
    '현재안전보건조치', '가능성(1-5)', '중대성(1-4)', '위험성점수', '위험성감소대책'
  ];
  allRows.push(headers);
  
  submissions.forEach(sub => {
    const baseInfo = [
      sub.id,
      sub.status === 'pending' ? '대기중' : sub.status === 'approved' ? '승인' : '거부',
      sub.submittedAt ? sub.submittedAt.toLocaleString('ko-KR') : '',
      sub.projectInfo.companyName,
      sub.projectInfo.constructionName,
      sub.projectInfo.location === '기타' ? sub.projectInfo.locationOther : sub.projectInfo.location,
      sub.projectInfo.contactPerson,
      sub.safetyTraining.completed ? '완료' : '미완료',
      sub.workPermit.type === 'general' ? '일반작업' : sub.workPermit.type === 'hazardous' ? '위험작업' : '미설정',
      sub.safetyPledge.agreeToAll ? '완료' : '미완료'
    ];
    
    // 위험성평가 항목이 있는 경우
    if (sub.riskAssessment.length > 0) {
      sub.riskAssessment.forEach((risk, index) => {
        const riskScore = risk.likelihood * risk.severity;
        const row = [
          ...baseInfo,
          (index + 1).toString(), // 위험항목번호
          risk.location, // 장소명(공정명)
          risk.task, // 세부작업명
          risk.hazard, // 유해위험요인
          risk.disasterType, // 재해유형분류
          risk.safetyMeasures, // 현재안전보건조치
          risk.likelihood.toString(), // 가능성
          risk.severity.toString(), // 중대성
          riskScore.toString(), // 위험성점수
          risk.reductionMeasures // 위험성감소대책
        ];
        allRows.push(row);
      });
    } else {
      // 위험성평가 항목이 없는 경우 기본 정보만 추가
      const row = [
        ...baseInfo,
        '', '', '', '', '', '', '', '', '', '' // 위험성평가 관련 빈 컬럼들
      ];
      allRows.push(row);
    }
  });
  
  // CSV 문자열 생성
  const csvContent = allRows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  // BOM 추가 (한글 깨짐 방지)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  
  // 다운로드
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `안전평가신청서_상세_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '')}.csv`;
  link.click();
  
  // 메모리 정리
  URL.revokeObjectURL(link.href);
};