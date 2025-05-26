import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DiabetesPrediction from "./DiabetesPrediction";
import Login from "./pages/Login";

function App() {
  /* 간단한 토큰 체크 */
  const token = localStorage.getItem("access_token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={token ? <DiabetesPrediction /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;