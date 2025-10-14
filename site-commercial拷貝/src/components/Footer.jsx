export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Texte copyright */}
        <p className="mb-2 md:mb-0">
          © 2025 ShopZen. Tous droits réservés.
        </p>

        {/* Liens sociaux */}
        <div className="flex space-x-4">
          <a href="#" className="hover:underline">
            Facebook
          </a>
          <a href="#" className="hover:underline">
            Instagram
          </a>
          <a href="#" className="hover:underline">
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
