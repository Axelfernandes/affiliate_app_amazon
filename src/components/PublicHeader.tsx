export default function PublicHeader() {
  // In a full app, these would be router links
  const handleNavClick = () => {
    alert("This would navigate to the admin page.");
  };

  return (
    <header className="flex justify-between items-center p-8 font-mono text-gray-300">
      <div className="text-lg">Auto-Niche</div>
      <nav className="flex space-x-6">
        <a href="#" className="hover:text-white">Products</a>
        <a href="#" className="hover:text-white">About</a>
        <button onClick={handleNavClick} className="hover:text-white">Admin</button>
      </nav>
    </header>
  );
}
