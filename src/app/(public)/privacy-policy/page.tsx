
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Database, Lock, Cookie, ExternalLink, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: "We collect personal information such as name, email, phone number, address, date of birth, and cricket-related details when you register, submit an enquiry, or sign up for membership. We may also collect payment information, medical history (if provided), and attendance records for operational purposes."
    },
    {
      icon: Shield,
      title: "How We Use Information",
      content: "Your information is used to manage your membership, communicate about training and matches, process payments, ensure safety, and improve our services. We do not sell your personal information to third parties without your explicit consent."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement industry-standard security measures to protect your data, including encrypted storage and secure payment processing. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
    },
    {
      icon: Cookie,
      title: "Cookies",
      content: "Our website uses cookies to enhance your experience, analyze site traffic, and remember your preferences. You can choose to disable cookies in your browser settings, though some features may not function properly."
    },
    {
      icon: ExternalLink,
      title: "Third Party Links",
      content: "Our website may contain links to external sites. We are not responsible for the privacy practices or content of these third-party websites. Please review their respective policies before providing any personal information."
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: "If you have questions about this Privacy Policy or wish to access, correct, or delete your data, please contact us at info@samarthcricket.com or visit the academy office during working hours."
    }
  ];

  return (
    <main className="min-h-screen pt-24">
      <Navbar />
      
      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-academy-gold/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Protecting your personal information is important to us.
          </p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="p-10 card border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-academy-gold/10 rounded-2xl flex items-center justify-center text-academy-gold">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                    {section.title}
                  </h2>
                </div>
                <p className="text-gray-400 leading-relaxed text-base">
                  {section.content}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
