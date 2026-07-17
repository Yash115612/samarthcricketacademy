
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, CreditCard, XCircle, AlertTriangle, Shield, Mail } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      icon: Check,
      title: "Acceptance of Terms",
      content: "By using our website, enrolling in our academy, or participating in our programs, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services. If you do not agree, please do not use our services."
    },
    {
      icon: Shield,
      title: "Membership Rules",
      content: "Members must follow our membership terms, including payment of fees, attendance policies, and code of conduct. We reserve the right to refuse or terminate membership for violations of our policies or disruptive behavior at our discretion."
    },
    {
      icon: CreditCard,
      title: "Payment Policy",
      content: "All membership fees are due on time and non-refundable unless otherwise specified. We accept multiple payment methods including UPI, bank transfer, and cash. Failure to make timely payments may result in suspension of services."
    },
    {
      icon: XCircle,
      title: "Cancellation Policy",
      content: "Cancellation requests must be submitted in writing. Refunds are subject to our discretion and may be prorated based on unused services. We retain a 7-day cooling-off period applies for new memberships, subject to terms."
    },
    {
      icon: AlertTriangle,
      title: "Code of Conduct",
      content: "Players, parents, and staff are expected to maintain respectful, sportsmanlike behavior at all times. Harassment, discrimination, or unsafe conduct will not be tolerated and may result in immediate termination."
    },
    {
      icon: Shield,
      title: "Limitation of Liability",
      content: "We are not liable for injury, loss, or damage occurring during training, matches, or use of facilities unless caused by our gross negligence. Participants are responsible for their own safety and insurance."
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: "For questions about these Terms, please contact us at info@samarthcricket.com or visit our office in Mira Bhayander, Mumbai."
    }
  ];

  return (
    <main className="min-h-screen pt-24">
      <Navbar />
      
      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-academy-red/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight text-white">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Rules and guidelines for using our services and membership.
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
                  <div className="w-12 h-12 bg-academy-red/10 rounded-2xl flex items-center justify-center text-academy-red">
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
