import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24">
        <ContactSection />
      </div>
    </main>
  );
}
