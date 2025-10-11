import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Accueil from "./page/Accueil";
import Produit from "./page/Produit";
import Commande from "./page/Commande";
import { AppStateProvider } from "./context/AppState";

// Wrapper pour ajouter les transitions aux routes
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence exitBeforeEnter>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Accueil />
            </motion.div>
          }
        />
        <Route
          path="/products"
          element={
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Produit />
            </motion.div>
          }
        />
        <Route
          path="/order"
          element={
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Commande />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppStateProvider> {/* Fournir le contexte global */}
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />

          <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-10">
            <AnimatedRoutes />
          </main>

          <Footer />
        </div>
      </Router>
    </AppStateProvider>
  );
}
