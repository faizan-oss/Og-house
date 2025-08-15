import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MyOrdersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <p className="text-muted-foreground">Order history coming soon...</p>
      </div>
      <Footer />
    </div>
  );
};

export default MyOrdersPage;
