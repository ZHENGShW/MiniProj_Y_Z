import { createContext, useContext, useMemo, useState } from "react";
import { products as seed } from "../data/products";

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  // Copie immuable des données initiales (stock)
  const [items, setItems] = useState(() => seed.map((p) => ({ ...p })));

  // Historique des commandes : { id, date, total, products: [{id,name,price,qty,subtotal}] }
  const [orders, setOrders] = useState([]);

  // Compteur simple (dérivé direct)
  const ordersCount = orders.length;

  //Appliquer une commande à partir d’une map { productId: qty }
  const applyOrder = (quantitiesMap) => {
    let total = 0;
    const orderedProducts = [];

    // 1) Calculer le prochain stock et la commande résultante (sans side-effects React)
    const nextItems = items.map((p) => {
      const orderedQty = Number(quantitiesMap[p.id] || 0);
      if (orderedQty > 0) {
        const newStock = Math.max(0, p.quantity - orderedQty);
        const subtotal = orderedQty * p.price;
        total += subtotal;

        orderedProducts.push({
          id: p.id,
          name: p.name,
          price: p.price,
          qty: orderedQty, // quantité vendue (à utiliser pour les stats)
          subtotal,
        });

        return { ...p, quantity: newStock };
      }
      return p;
    });

    // 2) Si au moins un article a été commandé : enregistrer l’opération
    if (orderedProducts.length > 0) {
      setItems(nextItems);
      setOrders((prev) => [
        ...prev,
        {
          id: Date.now(),
          date: new Date().toISOString(),
          total,
          products: orderedProducts,
        },
      ]);
    }
  };

  // Chiffre d’affaires cumulé
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  //Top produits vendus (agrégation par ID)

  const topProducts = useMemo(() => {
    const salesById = new Map();

    for (const o of orders) {
      for (const line of o.products ?? []) {
        const id = line.id;
        const name = line.name;
        const inc = Number(line.qty || 0);

        const prev = salesById.get(id) ?? { id, name, qty: 0 };
        prev.qty += inc;
        salesById.set(id, prev);
      }
    }

    return Array.from(salesById.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
  }, [orders]);

  // Valeur fournie par le contexte (mémoïsée pour éviter les re-rendus inutiles)
  const value = useMemo(
    () => ({
      // état
      items,
      orders,

      // dérivés
      ordersCount,
      totalRevenue,
      topProducts,

      // actions
      setItems, // exposé si besoin d’outils d’admin
      applyOrder,
    }),
    [items, orders, ordersCount, totalRevenue, topProducts]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// Hook d’accès pratique au contexte (avec garde)
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within <AppStateProvider>");
  }
  return ctx;
}
