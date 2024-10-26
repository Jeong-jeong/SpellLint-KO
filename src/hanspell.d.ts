declare module 'hanspell' {
  export interface HanspellOptions { }
  export function spellCheckByPNU(
    sentence: string,
    limit: number,
    callback: (result: HanspellResponse[]) => void,
    end?: (result: HanspellResponse[]) => void,
    error?: (error: Error) => void
  ): Promise<void>;
  export function spellCheckByDAUM(
    sentence: string,
    limit: number,
    callback: (result: HanspellResponse[]) => void,
    end?: (result: HanspellResponse[]) => void,
    error?: (error: Error) => void
  ): Promise<void>;
}

interface HanspellResponse {
  type: string; // space
  token: string;
  suggestions: string[];
  context: string;
}