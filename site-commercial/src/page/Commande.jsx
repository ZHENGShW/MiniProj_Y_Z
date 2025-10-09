import { useState } from "react";
import { products } from "../data/products";

export default function Commande() {
  const initialQuantities = products.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {});
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", quantities: initialQuantities });

  const handleChange = (id, value) => {
    const qty = Math.min(value, products.find(p => p.id === id).quantity);
    setFormData({ ...formData, quantities: { ...formData.quantities, [id]: qty } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Commande passée ! Vérifiez la console pour les détails.");
    console.log(formData);
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">Passer une commande</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input type="text" placeholder="Prénom" className="border p-2 w-full" required
            value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
        </div>
        <div>
          <input type="text" placeholder="Nom" className="border p-2 w-full" required
            value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
        </div>
        <div>
          <input type="email" placeholder="Email" className="border p-2 w-full" required
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div>
          <h3 className="font-bold mb-2">Sélection des produits</h3>
          {products.map(p => (
            <div key={p.id} className="mb-2">
              <span>{p.name} (Disponible: {p.quantity})</span>
              <input
                type="number"
                min="0"
                max={p.quantity}
                value={formData.quantities[p.id]}
                onChange={(e) => handleChange(p.id, parseInt(e.target.value) || 0)}
                className="border p-1 ml-2 w-20"
              />
            </div>
          ))}
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Commander</button>
      </form>
    </div>
  );
}
