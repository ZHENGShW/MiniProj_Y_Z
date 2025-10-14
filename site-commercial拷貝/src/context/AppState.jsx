import { createContext, useContext, useMemo, useState } from "react";
import { products as seed } from "../data/products";

// ——————————————————————————————————————— //
//  CONTEXTE GLOBAL DE L’APPLICATION
// ——————————————————————————————————————— //
const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  // Copie des données de base (stock initial)
  const [items, setItems] = useState(() => seed.map(p => ({ ...p })));

  // Historique des commandes : tableau d’objets { id, date, total, produits }
  const [orders, setOrders] = useState([]);

  // Nombre total de commandes
  const ordersCount = orders.length;

  // —— Fonction principale : appliquer une commande —— //
  const applyOrder = (quantitiesMap) => {
    let total = 0;
    const orderedProducts = [];

    // Met à jour le stock et calcule le total de la commande
    setItems(prev =>
      prev.map(p => {
        const orderedQty = Number(quantitiesMap[p.id] || 0);
        if (orderedQty > 0) {
          const newStock = Math.max(0, p.quantity - orderedQty);
          const subtotal = orderedQty * p.price;
          total += subtotal;

          orderedProducts.push({
            id: p.id,
            name: p.name,
            price: p.price,
            qty: orderedQty,
            subtotal,
          });

          return { ...p, quantity: newStock };
        }
        return p;
      })
    );

    // Enregistre la commande dans l’historique
    if (orderedProducts.length > 0) {
      const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        total,
        products: orderedProducts,
      };
      setOrders(prev => [...prev, order]);
    }
  };

  // —— Dérivés utiles pour les stats —— //

  // Chiffre d’affaires cumulé
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  // Produits les plus vendus
  const topProducts = useMemo(() => {
    const salesMap = {};
    for (const o of orders) {
      for (const p of o.products) {
        salesMap[p.name] = (salesMap[p.name] || 0) + p.qty;
      }
    }
    return Object.entries(salesMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
  }, [orders]);

  // —— Valeur du contexte —— //
  const value = useMemo(
    () => ({
      items,
      setItems,
      orders,
      ordersCount,
      totalRevenue,
      topProducts,
      applyOrder,
    }),
    [items, orders, totalRevenue, topProducts]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// Hook d’accès
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx)
    throw new Error("useAppState must be used within <AppStateProvider>");
  return ctx;
}