import React, { useState, useCallback, useEffect } from 'react';
import { WordInputForm } from './components/WordInputForm';
import { MnemonicCard } from './components/MnemonicCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiKeyModal } from './components/ApiKeyModal';
import { generateWordData, generateImage } from './services/geminiService';
import { getApiKey } from './services/cryptoService';
import type { WordData } from './types';

const App: React.FC = () => {
  const [word, setWord] = useState<string>('');
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  const checkApiKey = useCallback(async () => {
    setIsCheckingKey(true);
    const key = await getApiKey();
    setIsApiKeySet(!!key);
    setIsCheckingKey(false);
    if (!key) {
      // 키가 설정되지 않은 경우 모달을 자동으로 엽니다.
      setIsApiKeyModalOpen(true);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isApiKeySet) {
      setError('API 키를 먼저 설정해주세요.');
      setIsApiKeyModalOpen(true);
      return;
    }
    if (!word.trim()) {
      setError('단어를 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWordData(null);
    setImageUrl(null);

    try {
      const data = await generateWordData(word);
      setWordData(data);

      generateImage(data.imagePrompt)
        .then(url => setImageUrl(url))
        .catch(imageError => {
          console.error('이미지 생성 실패:', imageError);
        });

    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message.includes('API 키')) {
          setError(err.message);
          setIsApiKeySet(false);
          setIsApiKeyModalOpen(true);
      } else {
        setError('연상법 생성에 실패했습니다. 단어를 확인하거나 나중에 다시 시도해 주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [word, isApiKeySet]);

  if (isCheckingKey) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <LoadingSpinner />
        </div>
      )
  }

  return (
    <>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={() => {
          setIsApiKeySet(true);
          setIsApiKeyModalOpen(false);
          setError(null); // 키가 성공적으로 저장되면 오류를 지웁니다.
        }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
        <header className="w-full max-w-4xl text-center mb-8 relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 mb-2">
            영단어 암기 마스터
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            영어 단어를 입력하고 AI의 도움으로 기억력을 향상시켜 보세요!
          </p>
          <button 
            onClick={() => setIsApiKeyModalOpen(true)}
            className="absolute top-0 right-0 p-2 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            aria-label="API 키 설정"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        <main className="w-full max-w-2xl flex-grow">
          <div className="sticky top-4 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl shadow-lg mb-8">
            <WordInputForm
              word={word}
              setWord={setWord}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
          
          {isLoading && !wordData && <LoadingSpinner />}
          
          {error && <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>}
          
          {wordData && (
            <MnemonicCard 
              word={word} 
              data={wordData} 
              imageUrl={imageUrl}
              isLoadingImage={isLoading && !imageUrl}
            />
          )}

          {!isLoading && !wordData && !error && (
              <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75h4.5M9.75 17.25h4.5M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9z" />
                  </svg>
                  <h2 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-300">학습할 준비가 되셨나요?</h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    {isApiKeySet ? '더 나은 어휘력을 향한 여정이 여기서 시작됩니다.' : '시작하려면 먼저 API 키를 설정해주세요.'}
                  </p>
              </div>
          )}
        </main>
        
        <footer className="w-full max-w-4xl text-center mt-auto pt-8 text-sm text-slate-500 dark:text-slate-500">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </>
  );
};

export default App;
