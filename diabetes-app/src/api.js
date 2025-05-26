// diabetes-app/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

export const predictDiabetes = (payload) =>
  api.post("/predict", { data: payload });
