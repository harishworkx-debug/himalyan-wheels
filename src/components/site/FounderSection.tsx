import nitinImg from "@/assets/founders/nitin-garg.png";
import ramanImg from "@/assets/founders/raman-garg.png";
import { Section, SectionHeading } from "./Section";
import { Reveal } from "./Reveal";

const founders = [
  { name: "Nitin Garg", role: "Co-Founder", image: nitinImg },
  { name: "Raman Garg", role: "Co-Founder", image: ramanImg },
];

export function FounderSection() {
  return (
    <Section className="hairline">
      <SectionHeading
        align="center"
        eyebrow="Founders"
        title="Meet the Founders"
        subtitle="The people behind Himalyan Wheels, committed to a transparent and customer-first experience."
      />
      <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2">
        {founders.map((f, i) => (
          <Reveal key={f.name} delay={i * 100}>
            <div className="group overflow-hidden rounded-2xl border border-border bg-card text-center transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                <img
                  src={f.image}
                  alt={`${f.name}, ${f.role} at Himalyan Wheels`}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-all duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold">{f.name}</h3>
                <p className="text-gold mt-1 text-xs font-semibold tracking-[0.2em] uppercase">
                  {f.role}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
