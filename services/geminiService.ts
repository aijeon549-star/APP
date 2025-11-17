
import { GoogleGenAI, Type } from "@google/genai";
import type { WordData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wordDataSchema = {
    type: Type.OBJECT,
    properties: {
        definition: {
            type: Type.STRING,
            description: '단어에 대한 명확하고 간단한 정의.',
        },
        etymology: {
            type: Type.STRING,
            description: '단어의 뿌리를 설명하는 단어의 기원 이야기.',
        },
        mnemonic: {
            type: Type.STRING,
            description: '단어의 의미를 기억하는 데 도움이 되는 창의적인 문장, 이야기 또는 연상법.',
        },
        exampleSentences: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '문맥 속에서 단어를 사용하는 다양한 문장 3개로 구성된 배열.',
        },
        synonyms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '비슷한 의미를 가진 단어들의 배열. 없는 경우 빈 배열을 제공하세요.'
        },
        antonyms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '반대 의미를 가진 단어들의 배열. 없는 경우 빈 배열을 제공하세요.'
        },
        imagePrompt: {
            type: Type.STRING,
            description: '단어의 의미의 본질을 기억에 남고 예술적인 방식으로 포착하는 AI 이미지 생성기를 위한 상세하고 시각적으로 풍부한 SFW(안전한 작업 환경) 프롬프트. 예를 들어 "ephemeral"의 경우 "바람에 픽셀로 녹아내리는 섬세한 벚꽃 잎, 영화 같은 조명, 고화질"을 제안하세요.',
        },
    },
    required: ['definition', 'etymology', 'mnemonic', 'exampleSentences', 'synonyms', 'antonyms', 'imagePrompt']
};

export const generateWordData = async (word: string): Promise<WordData> => {
    const prompt = `영어 단어 '${word}'에 대해 암기에 도움이 되도록 상세한 분석을 제공해 주세요. 제공된 스키마를 준수하는 JSON 객체를 생성하세요. 모든 필드가 정확하고 창의적으로 채워지도록 하고, 모든 설명과 내용은 한국어로 작성해주세요.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: wordDataSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsedData = JSON.parse(jsonText);
        // Basic validation to ensure the parsed object matches the expected structure
        if (typeof parsedData.definition !== 'string' || !Array.isArray(parsedData.exampleSentences)) {
             throw new Error("Parsed JSON does not match WordData structure");
        }
        return parsedData as WordData;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonText);
        throw new Error("Received an invalid format from the API.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } else {
        throw new Error("No image was generated.");
    }
};
