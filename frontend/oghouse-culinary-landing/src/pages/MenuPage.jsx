import Navbar from "@/components/Navbar";
import MenuGrid from "@/components/menu/MenuGrid";
import Footer from "@/components/Footer";

const MenuPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MenuGrid />
      <Footer />
    </div>
  );
};

export default MenuPage;
