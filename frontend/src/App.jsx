import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Solve from "./pages/Solve";
import Login from "./pages/Login";

function App() {

  return (

      <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Solve Problem Page */}
        <Route path="/solve/:problemId" element={<Solve />} />
        

      </Routes>
    </BrowserRouter>
  
  );
}

export default App;