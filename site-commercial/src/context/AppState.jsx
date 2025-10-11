import { createContext, useContext, useMemo, useState } from "react";
import { products as seed } from "../data/products";

// État global partagé : conservé seulement pendant la session actuelle (réinitialisé au rafraîchissement)
const AppStateContext = createContext(null);

// —— Fournisseur de contexte global —— //
// Ce composant encapsule toute l’application et fournit les données globales (produits, commandes, etc.)
export function AppStateProvider({ children }) {
  // Copie des données de base (seed) pour constituer le stock actuel manipulable
  const [items, setItems] = useState(() => seed.map(p => ({ ...p })));

  // Compteur de commandes passées (nombre de validations de commande)
  const [ordersCount, setOrdersCount] = useState(0);

  // —— Fonction de traitement de commande —— //
  // Lorsqu’une commande est confirmée :
  // 1. On décrémente le stock de chaque produit commandé
  // 2. On incrémente le compteur de commandes
  const applyOrder = (quantitiesMap) => {
    setItems(prev =>
      prev.map(p => {
        const ordered = Number(quantitiesMap[p.id] || 0); // quantité commandée
        // Si > 0, on diminue le stock disponible (sans passer sous 0)
        return ordered > 0
          ? { ...p, quantity: Math.max(0, p.quantity - ordered) }
          : p;
      })
    );
    setOrdersCount(c => c + 1);
  };

  // —— Valeur de contexte mémoïsée —— //
  // Regroupe toutes les données et actions partagées à travers l’application
  const value = useMemo(
    () => ({ items, setItems, ordersCount, applyOrder }),
    [items, ordersCount]
  );

  // —— Fourniture du contexte à tous les enfants —— //
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// —— Hook personnalisé : accès facile au contexte —— //
// Fournit un moyen simple et sûr d'accéder à AppState depuis n’importe quel composant enfant.
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx)
    throw new Error("useAppState must be used within <AppStateProvider>");
  return ctx;
}
