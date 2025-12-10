import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export function Layout({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="flex-1 w-full"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
