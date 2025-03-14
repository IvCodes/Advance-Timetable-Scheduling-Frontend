import { createAsyncThunk } from "@reduxjs/toolkit";
import makeApi from "../../../config/axiosConfig";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: "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",
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

// export const llmResponse = createAsyncThunk("timetable/llm", async (scores) => {
//   const stri = scores.join(" ");
//   console.log(stri);
//   // const chatCompletion = await client.chat.completions.create({
//   //   messages: [
//   //     { role: "user", content: "Explain the importance of low latency LLMs" },
//   //   ],import { llmResponse } from './timetable.api';

//   //   model: "llama3-8b-8192",
//   // });
//   // console.log(chatCompletion);
//   // return chatCompletion.choices[0].message.content;
// });

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

export const editTimetable = createAsyncThunk(
  "timetable/edit",
  async ({ timetableId, timetableData, sessionId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/timetable/timetable/${timetableId}/activity/${sessionId}`,
        timetableData
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      throw error;
    }
  }
);

export const llmResponse = async (scores) => {
  const evaluationSummary = formatScoresForAPI(scores);

  const prompt = `
The following are evaluation scores for different algorithms used in a timetable scheduling optimization project:
${evaluationSummary}

Based on these results of this round of generation, provide a small analysis of the suitaility of the algorithm. Do not use more than 60 words. Also remember that the algorithms are in the early stage of development. First mention the scores of each algorithm and then provide the analysis.
`;

  console.log("Prompt for LLM:", prompt);

  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192",
  });

  console.log("LLM Response:", chatCompletion);
  return chatCompletion.choices[0].message.content;
};

function formatScoresForAPI(evaluation) {
  console.log("Evaluation:", evaluation);
  var x = {
    GA: { average_score: evaluation.GA.average_score },
    CO: { average_score: evaluation.CO.average_score },
    RL: { average_score: evaluation.RL.average_score },
    BC: { average_score: evaluation.BC.average_score },
    PSO: { average_score: evaluation.PSO.average_score },
  };
  const formattedScores = Object.entries(x)
    .map(([algorithm, data]) => {
      const algorithmName =
        algorithm === "GA"
          ? "Genetic Algorithms"
          : algorithm === "CO"
          ? "Ant Colony Optimization"
          : algorithm === "BC"
          ? "Bee Colony Optimization"
          : algorithm === "PSO"
          ? "Particle Swarm Optimization"
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
