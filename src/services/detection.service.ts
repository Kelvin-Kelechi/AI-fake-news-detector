import {
  NewsArticle,
  DetectionResult,
  DetectionRequest,
  DetectionResponse,
} from "../types";
import { AIDetectionService } from "./ai-detection.service";

const aiDetectionService = new AIDetectionService();

export class DetectionService {
  async detectFakeNews(request: DetectionRequest): Promise<DetectionResponse> {
    const { article } = request;

    // Perform AI-based analysis
    const result = await aiDetectionService.analyzeArticle(article);

    return {
      result,
      timestamp: new Date().toISOString(),
    };
  }
}
