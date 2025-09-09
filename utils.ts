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

// html2canvas 캡처 전에 요소 내 모든 이미지 로딩을 보장
const waitForImages = async (root: HTMLElement): Promise<void> => {
  const images: HTMLImageElement[] = Array.from(root.querySelectorAll('img'));
  if (images.length === 0) return;

  console.log(`이미지 ${images.length}개 로딩 대기 중...`);

  await Promise.all(images.map(async (img, index) => {
    try {
      // 이미지가 이미 로드된 경우
      if (img.complete && img.naturalWidth > 0) {
        console.log(`이미지 ${index + 1}: 이미 로드됨`);
        return;
      }

      // 이미지 로딩 대기
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.log(`이미지 ${index + 1}: 타임아웃`);
          resolve();
        }, 3000); // 3초 타임아웃

        img.onload = () => {
          clearTimeout(timeout);
          console.log(`이미지 ${index + 1}: 로드 완료`);
          resolve();
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          console.log(`이미지 ${index + 1}: 로드 실패`);
          resolve();
        };

        // 이미지 src가 없거나 빈 경우 처리
        if (!img.src || img.src === '') {
          clearTimeout(timeout);
          console.log(`이미지 ${index + 1}: src 없음`);
          resolve();
        }
      });

      // 최신 브라우저에서 decode() 사용
      if ('decode' in img && img.src && img.complete) {
        try {
          await (img as any).decode();
          console.log(`이미지 ${index + 1}: decode 완료`);
        } catch (e) {
          console.log(`이미지 ${index + 1}: decode 실패`, e);
        }
      }
    } catch (error) {
      console.log(`이미지 ${index + 1}: 처리 중 오류`, error);
    }
  }));

  console.log('모든 이미지 로딩 완료');
};

// 섹션 오프셋(상단 위치, CSS px 기준)을 계산
const getSectionOffsets = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const getTop = (sel: string): number | null => {
    const el = element.querySelector(sel) as HTMLElement | null;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.top - rect.top; // CSS px 기준
  };
  return {
    safetyTop: getTop('[data-section="safety-pledge"]'),
    workTop: getTop('[data-section="work-permit"]'),
    totalHeightCss: element.scrollHeight
  } as const;
};

// 안전한 페이지 분할용 앵커 수집 (섹션/테이블 행/블록 단위)
const collectBreakAnchors = (element: HTMLElement): number[] => {
  const rootRect = element.getBoundingClientRect();
  const selectors = [
    'tr',
    '.pdf-section',
    '[data-section]',
    '[data-break-anchor]',
    '.p-4',
    '.p-3',
  ];
  const nodeList = element.querySelectorAll(selectors.join(','));
  const anchors: number[] = [];
  nodeList.forEach((el) => {
    const r = (el as HTMLElement).getBoundingClientRect();
    const top = r.top - rootRect.top;
    if (top > 0 && Number.isFinite(top)) {
      anchors.push(top);
    }
  });
  // 정렬 및 근접 값 중복 제거(5px 이내는 하나로)
  anchors.sort((a, b) => a - b);
  const dedup: number[] = [];
  for (const v of anchors) {
    if (dedup.length === 0 || Math.abs(dedup[dedup.length - 1] - v) > 5) {
      dedup.push(v);
    }
  }
  return dedup;
};

export const downloadSubmissionAsPdf = async (element: HTMLElement, filename: string): Promise<void> => {
  if (!element) {
    console.error("Element to print not found.");
    return;
  }
  
  // PDF 생성을 위해 임시로 스타일 조정
  const originalStyle = element.style.cssText;
  element.style.cssText += `
    page-break-inside: avoid;
    break-inside: avoid;
    box-decoration-break: slice;
  `;
  
  // 테이블과 중요 섹션에 data-section 속성 추가
  const tables = element.querySelectorAll('table');
  tables.forEach((table, index) => {
    table.setAttribute('data-section', `table-${index}`);
  });
  
  const sections = element.querySelectorAll('.space-y-4 > div');
  sections.forEach((section, index) => {
    const el = section as HTMLElement;
    if (!el.getAttribute('data-section')) {
      el.setAttribute('data-section', `section-${index}`);
    }
  });
  
  try {
    // 이미지 로딩 대기 (서명 이미지 등)
    await waitForImages(element);
    // 레이아웃 안정화 대기 (서체/아이콘 등)
    await new Promise((r) => setTimeout(r, 150));

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
    
    // 공통 캔버스 렌더러
    const renderToCanvas = async (target: HTMLElement): Promise<HTMLCanvasElement> => {
      const canvas = await html2canvas(target, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        height: target.scrollHeight,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
        onclone: (doc) => {
          const imgs = doc.querySelectorAll('img');
          imgs.forEach((img: any) => {
            img.style.imageRendering = 'high-quality';
            img.style.maxWidth = 'none';
            img.style.maxHeight = 'none';
          });
        }
      });
      return canvas;
    };

    // 캔버스를 페이지 단위로 잘라 추가 (무제한 페이지)
    const addCanvasPagedSliced = (canvas: HTMLCanvasElement): number => {
      const canvasWidthPx = canvas.width;
      const canvasHeightPx = canvas.height;
      // html2canvas scale=3 고려하여 mm/px 비율 계산
      const mmPerPixel = usableWidth / (canvasWidthPx / 3);
      const pageHeightPx = Math.floor(usableHeight / mmPerPixel);
      let pages = 0;

      for (let y = 0; y < canvasHeightPx; y += pageHeightPx) {
        const sliceHeightPx = Math.min(pageHeightPx, canvasHeightPx - y);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvasWidthPx;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) break;
        ctx.drawImage(
          canvas,
          0,
          y,
          canvasWidthPx,
          sliceHeightPx,
          0,
          0,
          canvasWidthPx,
          sliceHeightPx
        );

        if (pages > 0) pdf.addPage();
        const sliceHeightMm = sliceHeightPx * mmPerPixel;
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, usableWidth, sliceHeightMm, undefined, 'FAST');
        pages += 1;
      }
      return pages;
    };

    // 원본 요소 전체를 한 번에 렌더링하고 순서대로 페이지에 추가
    const fullCanvas = await renderToCanvas(element);
    const totalPages = addCanvasPagedSliced(fullCanvas);

    // 저장
    pdf.save(filename);
    console.log(`PDF 파일 "${filename}" 생성 완료 (${totalPages} 페이지)`);
    
  } finally {
    // 원래 스타일 복원
    element.style.cssText = originalStyle;
    
    // 임시로 추가한 data-section 속성 제거
    const tempSections = element.querySelectorAll('[data-section]');
    tempSections.forEach(section => {
      section.removeAttribute('data-section');
    });
  }
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