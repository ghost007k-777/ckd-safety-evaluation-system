import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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