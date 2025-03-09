import { createAsyncThunk } from "@reduxjs/toolkit";
import makeApi from "../../../config/axiosConfig";
import { OpenAI } from "openai";

// Configure OpenAI client to use OpenRouter
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,  // Changed from process.env
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

const api = makeApi();

export const generateTimetable = createAsyncThunk(
  "timetable/generate",
  async () => {
    const response = await api.post("/timetable/generate");
    return response.data;
  }
);

export const getTimetable = createAsyncThunk(
  "timetable/timetables",
  async () => {
    const response = await api.get("/timetable/timetables");
    return response.data;
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    const response = await api.put('/timetable/notifications/mark-all-read');
    return response.data;
  }
);

export const selectAlgorithm = createAsyncThunk(
  "timetable/select",
  async (algorithm) => {
    const result = await api.post("/timetable/select", { algorithm });
    return result.data;
  }
);

export const getSelectedAlgorithm = createAsyncThunk(
  "timetable/selected",
  async () => {
    const result = await api.get("/timetable/selected");
    console.log("Selected Algorithm:", result.data);
    return result.data;
  }
);

export const llmResponse = async (scores) => {
  const evaluationSummary = formatScoresForAPI(scores);

  const prompt = `
The following are evaluation scores for different algorithms used in a timetable scheduling optimization project:
${evaluationSummary}

Based on these results, provide an analysis of each algorithm in this format:
1. First, list the algorithms from best to worst based on their scores
2. Then, for each algorithm, provide a 1-2 sentence description of its suitability for timetable generation
3. Finally, provide a clear recommendation about which algorithm should be used and why

Keep your entire response under 150 words. Be specific about the strengths and weaknesses of each algorithm based on the metrics provided.
`;

  console.log("Prompt for LLM:", prompt);

  try {
    // Using the OpenRouter API with the correct parameters format
    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat:free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 250,
      headers: {
        "HTTP-Referer": window.location.origin, // Required for OpenRouter
        "X-Title": "Timetable Evaluation System" // Site title for OpenRouter rankings
      }
    });

    console.log("OpenRouter Response:", completion);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error with OpenRouter API:", error);
    // Log detailed error information for debugging
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
    return "Error generating recommendation. Please try again later.";
  }
};

function formatScoresForAPI(evaluation) {
  console.log("Evaluation:", evaluation);
  var x = {
    GA: { average_score: evaluation.GA.average_score },
    CO: { average_score: evaluation.CO.average_score },
    RL: { average_score: evaluation.RL.average_score },
  };
  const formattedScores = Object.entries(x)
    .map(([algorithm, data]) => {
      const algorithmName =
        algorithm === "GA"
          ? "Genetic Algorithms"
          : algorithm === "CO"
          ? "Ant Colony Optimization"
          : "Reinforcement Learning";
      return `${algorithmName} achieved an average score of ${data?.average_score?.toFixed(
        2
      )}.`;
    })
    .join(" ");

  return `Evaluation Summary: ${formattedScores}`;
}

export const getNotifications = createAsyncThunk(
  "timetable/notifications",
  async () => {
    const response = await api.get("/timetable/notifications");
    return response.data;
  }
);

export const setNotificationRead = createAsyncThunk(
  "timetable/read",
  async (id) => {
    const response = await api.put(`/timetable/notifications/${id}`);
    return response.data;
  }
);
