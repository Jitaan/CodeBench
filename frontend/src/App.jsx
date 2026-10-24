import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Solve from "./pages/Solve";
import Login from "./pages/Login";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";

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
        
        {/* Contest Pages */}
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:contestId" element={<ContestDetail />} />
        

      </Routes>
    </BrowserRouter>
  
  );
}

export default App;
