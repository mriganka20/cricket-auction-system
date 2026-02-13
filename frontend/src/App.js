import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Auction from "./pages/Auction";
import Players from "./pages/Players";
import Summary from "./pages/Summary";
import AddPlayer from "./pages/AddPlayer";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Auction />} />
          <Route path="/players" element={<Players />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/add-player" element={<AddPlayer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
