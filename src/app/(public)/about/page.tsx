import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Trophy, Target, Award, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24">
      <Navbar />
      
      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-academy-red/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight">OUR STORY</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Developing disciplined, skilled, and confident cricketers from Mira Bhayander, Mumbai — since 2011.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-10 card border-academy-red/20">
            <div className="w-16 h-16 bg-academy-red/10 rounded-2xl flex items-center justify-center mb-6 text-academy-red">
              <Target size={32} />
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              To provide structured, professional cricket training to aspiring players of all ages
              right here in Mira Bhayander, Mumbai. We focus on technical excellence, mental discipline,
              and physical fitness — identifying raw talent from the grassroots and giving each player
              a clear pathway to district, state, and national-level competition.
            </p>
          </div>
          <div className="p-10 card border-academy-gold/20">
            <div className="w-16 h-16 bg-academy-gold/10 rounded-2xl flex items-center justify-center mb-6 text-academy-gold">
              <Award size={32} />
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              To be Mumbai&apos;s most trusted cricket development institution — known not just for wins,
              but for producing players with the character, technique, and temperament to perform at
              the highest level. We believe every committed cricketer deserves access to quality coaching,
              regardless of background.
            </p>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-24 px-6 bg-academy-gray/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase mb-4">Our Achievements</h2>
            <div className="w-24 h-1 bg-academy-red mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { year: "2023", title: "District Champions", desc: "Our Under-19 squad won the Thane District Inter-Academy Tournament." },
              { year: "2020", title: "50+ State Selections", desc: "Over 50 academy players selected for state-level trials across age groups." },
              { year: "2017", title: "First National Call-Up", desc: "Academy player Rohit Sharma (Jr.) selected for Mumbai U-19 Ranji squad." },
            ].map((ach, i) => (
              <div key={i} className="card p-8 group hover:border-academy-gold transition-colors">
                <span className="text-academy-gold font-black text-4xl mb-4 block">{ach.year}</span>
                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">{ach.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{ach.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
