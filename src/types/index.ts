export interface NewsArticle {
  title: string;
  content: string;
  source?: string;
  url?: string;
  publishedDate?: string;
}

export interface DetectionResult {
  isFake: boolean;
  confidence: number;
  explanation: string;
  features: {
    [key: string]: number;
  };
}

export interface DetectionRequest {
  article: NewsArticle;
}

export interface DetectionResponse {
  result: DetectionResult;
  timestamp: string;
}
