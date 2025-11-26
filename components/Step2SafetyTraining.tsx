import React, { useState, useEffect } from 'react';
import { SafetyTraining, WorkTypeSelection, HeightWorkSubType, TrainingAttendee } from '../types.ts';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { SignaturePad } from './SignaturePad.tsx';
import { HEIGHT_WORK_VIDEOS } from '../constants.ts';

// ⚠️ 테스트 모드 설정 - 배포 전에 false로 변경하세요!
const TEST_MODE = false;

interface Step2Props {
  data: SafetyTraining;
  updateData: (field: keyof SafetyTraining, value: boolean | Date | null | number | TrainingAttendee[]) => void;
  onComplete: () => void;
}

interface VideoConfig {
  type: keyof WorkTypeSelection | 'heightWorkLadder' | 'heightWorkScaffold' | 'heightWorkHangingScaffold';
  title: string;
  url: string;
}

export const Step2SafetyTraining: React.FC<Step2Props> = ({ data, updateData, onComplete }) => {
  const [currentVideoCompleted, setCurrentVideoCompleted] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAttendeeForm, setShowAttendeeForm] = useState(false);
  const [tempAttendees, setTempAttendees] = useState<TrainingAttendee[]>([
    { id: '1', name: '', signature: '', trainingType: '' }
  ]);

  // Video configurations
  const baseVideoConfigs: VideoConfig[] = [
    { type: 'general', title: '일반작업 안전교육', url: 'https://youtu.be/AEmvaCOJ9bg?si=vsRnpcKAO7QCMbFu' },
    { type: 'confined', title: '밀폐공간작업 안전교육', url: 'https://www.youtube.com/watch?v=6886vrKJ9-g' },
    { type: 'hotWork', title: '화기작업 안전교육', url: 'https://youtu.be/thn3M_DmoWA?si=GC3LziifK6c7OMZR' }
  ];

  // Build video list including height work sub-types
  const buildVideoList = (): VideoConfig[] => {
    const videos: VideoConfig[] = [];

    // Add general work type
    if (data.workTypes.general) {
      videos.push(baseVideoConfigs.find(v => v.type === 'general')!);
    }

    // Add confined space
    if (data.workTypes.confined) {
      videos.push(baseVideoConfigs.find(v => v.type === 'confined')!);
    }

    // Add height work sub-types
    if (data.workTypes.heightWork && data.workTypes.heightWorkSubType) {
      if (data.workTypes.heightWorkSubType.ladder) {
        videos.push({
          type: 'heightWorkLadder',
          title: HEIGHT_WORK_VIDEOS.ladder.title,
          url: HEIGHT_WORK_VIDEOS.ladder.url
        });
      }
      if (data.workTypes.heightWorkSubType.scaffold) {
        videos.push({
          type: 'heightWorkScaffold',
          title: HEIGHT_WORK_VIDEOS.scaffold.title,
          url: HEIGHT_WORK_VIDEOS.scaffold.url
        });
      }
      if (data.workTypes.heightWorkSubType.hangingScaffold) {
        videos.push({
          type: 'heightWorkHangingScaffold',
          title: HEIGHT_WORK_VIDEOS.hangingScaffold.title,
          url: HEIGHT_WORK_VIDEOS.hangingScaffold.url
        });
      }
    }

    // Add hot work
    if (data.workTypes.hotWork) {
      videos.push(baseVideoConfigs.find(v => v.type === 'hotWork')!);
    }

    return videos;
  };

  // Get selected video types
  const selectedVideos = buildVideoList();
  const currentVideo = selectedVideos[data.currentVideoIndex];
  const isLastVideo = data.currentVideoIndex >= selectedVideos.length - 1;

  // 현재 영상이 이미 완료되었는지 확인 (attendees에 해당 교육 유형이 있는지)
  const isCurrentVideoAlreadyCompleted = currentVideo && data.attendees && data.attendees.length > 0
    ? data.attendees.some(attendee => attendee.trainingType === currentVideo.title)
    : false;

  // 영상 시청 타이머 (3분 = 180초)
  useEffect(() => {
    // 테스트 모드이거나 이미 완료한 교육이면 타이머 작동 안 함
    if (TEST_MODE || isCurrentVideoAlreadyCompleted) {
      return;
    }

    const timer = setInterval(() => {
      setWatchTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= 180) { // 3분
          setCanComplete(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data.currentVideoIndex, isCurrentVideoAlreadyCompleted]); // 영상이 바뀔 때마다 타이머 리셋

  // 영상이 바뀔 때 또는 완료 상태 체크
  useEffect(() => {
    if (isCurrentVideoAlreadyCompleted) {
      // 이미 완료한 교육이면 자동으로 완료 상태로 설정
      setCurrentVideoCompleted(true);
      setCanComplete(true);
      setWatchTime(180);
      setShowAttendeeForm(false);
    } else {
      // 새 교육이면 초기화
      setWatchTime(0);
      setCanComplete(false);
      setCurrentVideoCompleted(false);
      setShowAttendeeForm(false);
      setTempAttendees([{ id: '1', name: '', signature: '', trainingType: '' }]);
    }
  }, [data.currentVideoIndex, isCurrentVideoAlreadyCompleted]);

  // Helper function to convert YouTube URL to embed URL with autoplay
  const getYouTubeEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  // 시간 포맷 함수 (초 -> 분:초)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoComplete = () => {
    if (canComplete) {
      setCurrentVideoCompleted(true);
      // 매 영상마다 교육자 서명 폼 표시
      setShowAttendeeForm(true);
    } else {
      // 3분 미만이면 관리자 암호 입력 프롬프트 표시
      setShowAdminPrompt(true);
    }
  };

  // 테스트 모드 건너뛰기 버튼
  const handleSkipVideo = () => {
    setCurrentVideoCompleted(true);
    setCanComplete(true);
    setWatchTime(180);
    // 매 영상마다 교육자 서명 폼 표시
    setShowAttendeeForm(true);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin') {
      setCurrentVideoCompleted(true);
      // 매 영상마다 교육자 서명 폼 표시
      setShowAttendeeForm(true);
      setShowAdminPrompt(false);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('올바른 관리자 암호가 아닙니다.');
      setAdminPassword('');
    }
  };

  const handleAdminCancel = () => {
    setShowAdminPrompt(false);
    setAdminPassword('');
    setAdminError('');
  };

  // 교육자 추가
  const handleAddAttendee = () => {
    const newAttendee: TrainingAttendee = {
      id: Date.now().toString(),
      name: '',
      signature: '',
      trainingType: ''
    };
    setTempAttendees([...tempAttendees, newAttendee]);
  };

  // 교육자 삭제
  const handleRemoveAttendee = (id: string) => {
    if (tempAttendees.length > 1) {
      setTempAttendees(tempAttendees.filter(attendee => attendee.id !== id));
    }
  };

  // 교육자 이름 변경
  const handleAttendeeNameChange = (id: string, name: string) => {
    setTempAttendees(tempAttendees.map(attendee =>
      attendee.id === id ? { ...attendee, name } : attendee
    ));
  };

  // 교육자 서명 변경
  const handleAttendeeSignatureChange = (id: string, signature: string) => {
    setTempAttendees(tempAttendees.map(attendee =>
      attendee.id === id ? { ...attendee, signature } : attendee
    ));
  };

  // 교육자 정보 저장 및 다음 단계
  const handleSaveAttendeesAndNext = () => {
    // 모든 교육자의 이름과 서명이 입력되었는지 확인
    const allFilled = tempAttendees.every(attendee => attendee.name.trim() !== '' && attendee.signature !== '');

    if (!allFilled) {
      alert('모든 교육자의 성명과 서명을 입력해주세요.');
      return;
    }

    // 현재 영상의 교육자 정보에 교육 유형 추가
    const attendeesWithType = tempAttendees.map(attendee => ({
      ...attendee,
      trainingType: currentVideo.title // 현재 교육 영상의 제목 저장
    }));

    // 현재 영상의 교육자 정보를 data.attendees에 추가
    const updatedAttendees = [...(data.attendees || []), ...attendeesWithType];
    updateData('attendees', updatedAttendees);

    if (isLastVideo) {
      // All videos completed
      updateData('allVideosCompleted', true);
      updateData('completed', true);
      updateData('completionDate', new Date());
      onComplete();
    } else {
      // Move to next video
      updateData('currentVideoIndex', data.currentVideoIndex + 1);
      setCurrentVideoCompleted(false);
      setShowAttendeeForm(false);
      setTempAttendees([{ id: Date.now().toString(), name: '', signature: '', trainingType: '' }]);
    }
  };

  const handleNextVideo = () => {
    if (isLastVideo) {
      // All videos completed
      updateData('allVideosCompleted', true);
      updateData('completed', true);
      updateData('completionDate', new Date());
      onComplete();
    } else {
      // Move to next video
      updateData('currentVideoIndex', data.currentVideoIndex + 1);
      setCurrentVideoCompleted(false);
    }
  };

  const handlePreviousVideo = () => {
    if (data.currentVideoIndex > 0) {
      updateData('currentVideoIndex', data.currentVideoIndex - 1);
      setCurrentVideoCompleted(false);
    }
  };

  if (selectedVideos.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">선택된 작업 유형이 없습니다</h2>
          <p className="text-slate-500 mb-6">이전 단계로 돌아가서 작업 유형을 선택해주세요.</p>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">영상 정보를 불러올 수 없습니다</h2>
          <p className="text-slate-500 mb-6">이전 단계로 돌아가서 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
    </p>
        </div >
      </div >

  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
    <div className="p-8 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {currentVideo.title}
            {isCurrentVideoAlreadyCompleted && (
              <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full shadow-sm">
                ✓ 이수 완료
              </span>
            )}
            {TEST_MODE && (
              <span className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-full shadow-sm">
                🧪 테스트 모드
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {isCurrentVideoAlreadyCompleted ? '이미 완료한 교육입니다.' : '영상을 끝까지 시청해주세요.'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Progress</span>
          <p className="text-2xl font-black text-blue-600">
            {data.currentVideoIndex + 1} <span className="text-lg text-slate-300 font-medium">/ {selectedVideos.length}</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
          style={{ width: `${((data.currentVideoIndex + (currentVideoCompleted ? 1 : 0)) / selectedVideos.length) * 100}%` }}
        ></div>
      </div>

      {/* Video List Pills */}
      <div className="flex flex-wrap gap-2">
        {selectedVideos.map((video, index) => (
          <span
            key={video.type}
            className={`
                  px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-300 border
                  ${index < data.currentVideoIndex
                ? 'bg-green-50 text-green-700 border-green-200'
                : index === data.currentVideoIndex
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm scale-105'
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              }
                `}
          >
            {index < data.currentVideoIndex && '✓ '}{video.title}
          </span>
        ))}
      </div>

      {/* Video Player Container */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-slate-100">
        {currentVideo.url.startsWith('placeholder-') ? (
          <div className="w-full aspect-video bg-slate-800 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-2">교육 영상 준비중입니다</p>
            <p className="text-xs text-slate-600 font-mono mb-6">{currentVideo.url}</p>
            <Button
              onClick={handleVideoComplete}
              disabled={currentVideoCompleted}
              className="bg-slate-700 hover:bg-slate-600 text-white border-0"
            >
              {currentVideoCompleted ? '시청 완료' : '시청 완료 (임시)'}
            </Button>
          </div>
        ) : (
          <div className="relative w-full aspect-video">
            <iframe
              src={getYouTubeEmbedUrl(currentVideo.url)}
              title={currentVideo.title}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
        {TEST_MODE ? (
          <div className="flex flex-col items-center gap-4">
            <div className="px-4 py-2 bg-amber-100 rounded-lg text-amber-800 text-sm font-bold">
              🧪 테스트 모드 활성화됨
            </div>
            <Button
              onClick={handleSkipVideo}
              disabled={currentVideoCompleted}
              className={`w-full sm:w-auto px-8 py-3 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 ${currentVideoCompleted
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-500/30'
                }`}
            >
              {currentVideoCompleted ? '✓ 시청 완료됨' : '⏩ 테스트 건너뛰기'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-lg font-bold">
              <div className={`w-3 h-3 rounded-full ${canComplete ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
              <span className={canComplete ? 'text-green-600' : 'text-slate-700'}>
                {formatTime(watchTime)} <span className="text-slate-400">/ 3:00</span>
              </span>
            </div>

            <Button
              onClick={handleVideoComplete}
              disabled={currentVideoCompleted}
              className={`w-full sm:w-auto px-8 py-3 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 ${canComplete
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
              {currentVideoCompleted ? '✓ 시청 완료됨' : canComplete ? '영상 시청 완료' : '3분 시청 후 활성화됩니다'}
            </Button>

            {!canComplete && !currentVideoCompleted && (
              <button
                onClick={() => setShowAdminPrompt(true)}
                className="text-xs text-slate-400 hover:text-blue-500 underline transition-colors"
              >
                관리자 권한으로 건너뛰기
              </button>
            )}
          </div>
        )}
      </div>

      {/* Attendee Form */}
      {showAttendeeForm && currentVideoCompleted && (
        <div className="animate-fadeIn bg-blue-50/50 border border-blue-100 rounded-2xl p-8 shadow-inner">
          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">교육 이수 확인</h3>
            <p className="text-slate-500">
              교육을 완료한 모든 인원의 성명과 서명을 입력해주세요.
            </p>
          </div>

          <div className="space-y-6">
            {tempAttendees.map((attendee, index) => (
              <div key={attendee.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative group hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    교육자 정보
                  </h4>
                  {tempAttendees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee.id)}
                      className="text-rose-500 hover:text-rose-700 text-sm font-bold px-3 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <Input
                    id={`attendee-name-${attendee.id}`}
                    label="성명"
                    value={attendee.name}
                    onChange={(e) => handleAttendeeNameChange(attendee.id, e.target.value)}
                    placeholder="이름을 입력하세요"
                    required
                    className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                  />

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      서명 <span className="text-rose-500">*</span>
                    </label>
                    <div className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                      <SignaturePad
                        onEnd={(signature) => handleAttendeeSignatureChange(attendee.id, signature)}
                        signatureDataUrl={attendee.signature}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              variant="secondary"
              onClick={handleAddAttendee}
              className="flex-1 py-4 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-bold shadow-sm"
            >
              + 인원 추가
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAttendeesAndNext}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all"
            >
              {isLastVideo ? '모든 교육 완료하기' : '저장하고 다음 영상 보기'}
            </Button>
          </div>
        </div>
      )}

      {/* Completion Status */}
      {currentVideoCompleted && !showAttendeeForm && (
        <div className="animate-fadeIn bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-emerald-800 mb-2">
            {isLastVideo ? '모든 안전 교육을 이수했습니다!' : '현재 교육 이수 완료!'}
          </h3>
          <p className="text-emerald-600 mb-8 font-medium">
            {isLastVideo ? '다음 단계로 이동하여 위험성 평가를 진행해주세요.' : '다음 교육 영상을 시청해주세요.'}
          </p>

          <div className="flex justify-center gap-4">
            {data.currentVideoIndex > 0 && (
              <Button
                variant="secondary"
                onClick={handlePreviousVideo}
                className="bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                이전 영상
              </Button>
            )}
            <Button
              onClick={handleNextVideo}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg hover:shadow-emerald-500/30"
            >
              {isLastVideo ? '다음 단계로 이동' : '다음 영상 보기'}
            </Button>
          </div>
        </div>
      )}
    </div>
  </Card>

{/* Admin Password Modal */ }
{
  showAdminPrompt && (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">관리자 인증</h3>
          <p className="text-slate-500 text-sm mt-2">
            영상 시청 시간이 부족합니다.<br />관리자 권한으로 건너뛰시겠습니까?
          </p>
        </div>

        <form onSubmit={handleAdminSubmit}>
          <div className="mb-6">
            <Input
              type="password"
              id="admin-password"
              label="관리자 암호"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="암호를 입력하세요"
              autoFocus
              required
              className="text-center tracking-widest"
            />
            {adminError && (
              <p className="mt-2 text-sm text-rose-500 font-bold text-center animate-shake">{adminError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleAdminCancel}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold">
              인증하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
    </div >
  );
};
