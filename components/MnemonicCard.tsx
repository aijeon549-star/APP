
import React from 'react';
import type { WordData } from '../types';
import { ResultSection } from './ResultSection';

interface MnemonicCardProps {
  word: string;
  data: WordData;
  imageUrl: string | null;
  isLoadingImage: boolean;
}

const ImageDisplay: React.FC<{ imageUrl: string | null; isLoading: boolean; word: string }> = ({ imageUrl, isLoading, word }) => {
    if (isLoading) {
        return (
            <div className="w-full aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center animate-pulse">
                <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    if (imageUrl) {
        return <img src={imageUrl} alt={`'${word}'에 대한 AI 생성 이미지`} className="w-full aspect-square object-cover rounded-xl shadow-lg" />;
    }

    return null;
}

export const MnemonicCard: React.FC<MnemonicCardProps> = ({ word, data, imageUrl, isLoadingImage }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl font-bold capitalize text-slate-900 dark:text-white">{word}</h2>

          <ResultSection title="정의">
            <p className="text-lg">{data.definition}</p>
          </ResultSection>

          <ResultSection title="연상법">
            <p className="text-lg italic text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              "{data.mnemonic}"
            </p>
          </ResultSection>

          <ResultSection title="어원 (단어의 기원)">
            <p className="text-slate-600 dark:text-slate-400">{data.etymology}</p>
          </ResultSection>
        </div>

        <div className="flex items-center justify-center">
            <ImageDisplay imageUrl={imageUrl} isLoading={isLoadingImage} word={word}/>
        </div>
      </div>
      
      <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
        <ResultSection title="예문">
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
            {data.exampleSentences.map((sentence, index) => (
              <li key={index}>{sentence}</li>
            ))}
          </ul>
        </ResultSection>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.synonyms && data.synonyms.length > 0 && (
          <ResultSection title="동의어">
            <div className="flex flex-wrap gap-2">
              {data.synonyms.map((synonym, index) => (
                <span key={index} className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full">
                  {synonym}
                </span>
              ))}
            </div>
          </ResultSection>
        )}
        
        {data.antonyms && data.antonyms.length > 0 && (
          <ResultSection title="반의어">
            <div className="flex flex-wrap gap-2">
              {data.antonyms.map((antonym, index) => (
                <span key={index} className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-sm font-medium px-3 py-1 rounded-full">
                  {antonym}
                </span>
              ))}
            </div>
          </ResultSection>
        )}
      </div>
    </div>
  );
};
