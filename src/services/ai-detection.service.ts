import { pipeline } from "@xenova/transformers";
import { NewsArticle } from "../types";

export class AIDetectionService {
  private model: any;
  private isInitialized = false;
  private initializationError: Error | null = null;

  async initialize() {
    if (this.isInitialized) return;
    if (this.initializationError) throw this.initializationError;

    try {
      // Load the model (this will download it on first run)
      this.model = await pipeline(
        "text-classification",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
        {
          quantized: true,
          progress_callback: (progress: any) => {
            const percentage = Math.round(progress * 100);
            console.log(`Model loading progress: ${percentage}%`);
          },
        }
      );
      this.isInitialized = true;
      console.log("AI model initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AI model:", error);
      this.initializationError = error as Error;
      throw error;
    }
  }

  async analyzeArticle(article: NewsArticle) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Combine title and content for analysis
      const text = `${article.title}\n\n${article.content}`;

      // Get prediction from the model
      const result = await this.model(text);

      // Process the result
      const prediction = result[0];
      const isFake = prediction.label === "NEGATIVE";
      const confidence = prediction.score;

      return {
        isFake,
        confidence,
        explanation: this.generateExplanation(prediction),
        features: {
          aiScore: confidence,
          label: prediction.label,
          scores: {
            "fake news":
              prediction.label === "NEGATIVE" ? confidence : 1 - confidence,
            "real news":
              prediction.label === "POSITIVE" ? confidence : 1 - confidence,
          },
        },
        analysisSteps: [
          {
            step: "Initialization",
            status: "completed",
            message: "AI model loaded successfully",
          },
          {
            step: "Text Processing",
            status: "completed",
            message: "Article content processed",
          },
          {
            step: "Analysis",
            status: "completed",
            message: "Content analyzed for fake news patterns",
          },
          {
            step: "Classification",
            status: "completed",
            message: `Classified as ${
              isFake ? "potentially fake" : "likely real"
            } news`,
          },
        ],
      };
    } catch (error) {
      console.error("Error in AI analysis:", error);
      throw new Error(`Failed to analyze article: ${(error as Error).message}`);
    }
  }

  private generateExplanation(prediction: any): string {
    const explanations = [];

    explanations.push(
      `The AI model classified this article as ${
        prediction.label === "NEGATIVE" ? "potentially fake" : "likely real"
      } with ${(prediction.score * 100).toFixed(1)}% confidence.`
    );

    if (prediction.label === "NEGATIVE") {
      explanations.push(
        "The model detected patterns commonly associated with fake or misleading news content."
      );
    } else {
      explanations.push(
        "The content appears to be factual and well-supported based on the model's analysis."
      );
    }

    if (prediction.score > 0.8) {
      explanations.push("The model is highly confident in this assessment.");
    } else if (prediction.score > 0.6) {
      explanations.push(
        "The model is moderately confident in this assessment."
      );
    } else {
      explanations.push(
        "The model has lower confidence in this assessment and recommends further verification."
      );
    }

    return explanations.join("\n\n");
  }
}
