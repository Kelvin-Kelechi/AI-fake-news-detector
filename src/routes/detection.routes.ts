import express from "express";
import { DetectionService } from "../services/detection.service";
import { DetectionRequest } from "../types";

const router = express.Router();
const detectionService = new DetectionService();

router.post("/detect", async (req, res) => {
  try {
    const request: DetectionRequest = req.body;

    // Validate request
    if (
      !request.article ||
      !request.article.title ||
      !request.article.content
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request. Title and content are required.",
      });
    }

    const response = await detectionService.detectFakeNews(request);
    res.json(response);
  } catch (error) {
    console.error("Error in detection route:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the request.",
    });
  }
});

export default router;
