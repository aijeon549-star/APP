import React, { useState } from 'react';
import { testApiKey } from '../services/geminiService';
import { saveApiKey } from '../services/cryptoService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<TestStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleTestAndSave = async () => {
    setStatus('testing');
    setError(null);
    const isValid = await testApiKey(apiKey);
    if (isValid) {
      await saveApiKey(apiKey);
      setStatus('success');
      setTimeout(() => {
        onSave();
      }, 1000);
    } else {
      setStatus('error');
      setError('유효하지 않은 API 키이거나 네트워크에 연결할 수 없습니다. 키를 확인하고 다시 시도하세요.');
    }
  };
  
  const handleClose = () => {
      setApiKey('');
      setStatus('idle');
      setError(null);
      onClose();
  }

  if (!isOpen) return null;

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'testing': return 'text-blue-500';
      default: return 'text-slate-500';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success': return '성공! 키가 안전하게 저장되었습니다.';
      case 'error': return error;
      case 'testing': return 'API 키를 테스트하는 중...';
      default: return 'API 키를 입력하고 연결을 테스트하세요.';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full m-4 transform animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">API 키 설정</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Gemini API 키를 입력해주세요. 키는 로컬 드라이브에 안전하게 암호화되어 저장됩니다.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="여기에 API 키 붙여넣기"
          className="w-full px-4 py-3 text-lg bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
        />
        
        <div className={`mt-4 text-sm h-10 flex items-center justify-center p-2 rounded-md ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>

        <div className="flex items-center justify-end gap-4 mt-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleTestAndSave}
            disabled={!apiKey || status === 'testing' || status === 'success'}
            className="px-6 py-2 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
          >
            {status === 'testing' ? '테스트 중...' : '저장 및 테스트'}
          </button>
        </div>
      </div>
    </div>
  );
};
