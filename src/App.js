import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Stocker from "./components/stocker/Stocker";
import Tech from "./components/tech/Tech";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stocker" element={<Stocker />} />
        <Route path="/tech" element={<Tech />} />
      </Routes>
    </Router>
  );
}

export default App;
