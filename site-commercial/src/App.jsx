import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Accueil from "./page/Accueil";
import Produit from "./page/Produit";
import Commande from "./page/Commande";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/products" element={<Produit />} />
          <Route path="/order" element={<Commande />} />
        </Routes>
      </main>
      <Footer />
      </div>
    </Router>
  );
}
