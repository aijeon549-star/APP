
import React, { useState, useCallback } from 'react';
import { WordInputForm } from './components/WordInputForm';
import { MnemonicCard } from './components/MnemonicCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateWordData, generateImage } from './services/geminiService';
import type { WordData } from './types';

const App: React.FC = () => {
  const [word, setWord] = useState<string>('');
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
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

      // 텍스트 표시를 막지 않고 이미지 병렬 생성
      generateImage(data.imagePrompt)
        .then(url => setImageUrl(url))
        .catch(imageError => {
          console.error('이미지 생성 실패:', imageError);
          // 이미지에 대한 사용자 대상 오류는 설정하지 않음, 텍스트는 여전히 유용함
        });

    } catch (err) {
      console.error(err);
      setError('연상법 생성에 실패했습니다. 단어를 확인하거나 나중에 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [word]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 mb-2">
          영단어 암기 마스터
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          영어 단어를 입력하고 AI의 도움으로 기억력을 향상시켜 보세요!
        </p>
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
                <p className="mt-2 text-slate-500 dark:text-slate-400">더 나은 어휘력을 향한 여정이 여기서 시작됩니다.</p>
            </div>
        )}
      </main>
      
      <footer className="w-full max-w-4xl text-center mt-auto pt-8 text-sm text-slate-500 dark:text-slate-500">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
