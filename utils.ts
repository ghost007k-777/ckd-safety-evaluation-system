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
  
  // PDF 생성을 위한 준비
  const originalStyle = element.style.cssText;
  
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
    
    // 전체 크기를 90%로 조정
    const contentScale = 0.9;
    const scaledWidth = usableWidth * contentScale;
    const scaledHeight = usableHeight * contentScale;
    // 중앙 정렬을 위한 여백 계산
    const centerMarginX = margin + (usableWidth - scaledWidth) / 2;
    const centerMarginY = margin + (usableHeight - scaledHeight) / 2;
    
    // 공통 캔버스 렌더러 - 정상 크기로 렌더링
    const renderToCanvas = async (target: HTMLElement): Promise<HTMLCanvasElement> => {
      // 렌더링 전 대기 시간 추가
      await new Promise((r) => setTimeout(r, 100));
      
      const canvas = await html2canvas(target, {
        scale: 2, // 고품질 렌더링을 위한 스케일
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc, clonedElement) => {
          // 복제된 요소의 모든 스타일 정리
          clonedElement.style.transform = 'none';
          clonedElement.style.transformOrigin = 'initial';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.position = 'relative';
          
          // 모든 자식 요소의 transform 제거
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: any) => {
            el.style.transform = 'none';
            el.style.transformOrigin = 'initial';
          });
          
          // 이미지 최적화
          const imgs = clonedDoc.querySelectorAll('img');
          imgs.forEach((img: any) => {
            img.style.imageRendering = 'high-quality';
            img.style.display = 'block';
            // 서명 이미지의 경우 적절한 크기로 제한
            if (img.alt && (img.alt.includes('signature') || img.alt.includes('서명'))) {
              img.style.maxWidth = '200px';
              img.style.maxHeight = '80px';
              img.style.width = 'auto';
              img.style.height = 'auto';
              img.style.objectFit = 'contain';
            }
          });
          
          // 폰트 렌더링 최적화
          const textElements = clonedDoc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, td, th, label');
          textElements.forEach((el: any) => {
            el.style.webkitFontSmoothing = 'antialiased';
            el.style.mozOsxFontSmoothing = 'grayscale';
          });
        }
      });
      return canvas;
    };

    // 캔버스를 페이지 단위로 잘라 추가 (섹션이 여러 페이지에 걸칠 경우 대비)
    const addCanvasPagedSliced = (canvas: HTMLCanvasElement, isFirstSection: boolean): number => {
      const canvasWidthPx = canvas.width;
      const canvasHeightPx = canvas.height;
      
      // html2canvas scale=2 고려하여 mm/px 비율 계산 (90% 크기 적용)
      const mmPerPixel = (scaledWidth / (canvasWidthPx / 2));
      
      // 페이지 높이 계산 (90% 크기 적용)
      const pageHeightPx = Math.floor(scaledHeight / mmPerPixel);
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

        if (pages > 0 || !isFirstSection) pdf.addPage();
        const sliceHeightMm = sliceHeightPx * mmPerPixel;
        // 90% 크기로 중앙 정렬하여 추가
        pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 1.0), 'JPEG', centerMarginX, centerMarginY, scaledWidth, sliceHeightMm, undefined, 'SLOW');
        pages += 1;
      }
      return pages;
    };

    // data-pdf-page 속성을 가진 섹션들을 찾아서 각각 별도 페이지로 렌더링
    const pdfSections = Array.from(element.querySelectorAll('[data-pdf-page]')) as HTMLElement[];
    
    console.log(`📄 [PDF] ${pdfSections.length}개의 섹션을 개별 페이지로 생성합니다.`);
    
    let totalPages = 0;
    for (let i = 0; i < pdfSections.length; i++) {
      const section = pdfSections[i];
      console.log(`📄 [PDF] 섹션 ${i + 1}/${pdfSections.length} 렌더링 중...`);
      
      const sectionCanvas = await renderToCanvas(section);
      const sectionPages = addCanvasPagedSliced(sectionCanvas, i === 0);
      totalPages += sectionPages;
      
      console.log(`✅ [PDF] 섹션 ${i + 1} 완료 (${sectionPages} 페이지)`);
    }

    // 저장
    pdf.save(filename);
    console.log(`✅ [PDF] 파일 "${filename}" 생성 완료 (총 ${totalPages} 페이지)`);
    
  } finally {
    // 원래 스타일 복원
    element.style.cssText = originalStyle;
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