import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  ChartBar as BarChart3,
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Compass,
  Fuel,
  Gauge,
  Instagram,
  Landmark,
  Maximize2,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { cars as sampleCars, formatPrice, type Car } from "./data/cars";
import {
  carWhatsAppUrl,
  exchangeWhatsAppUrl,
  financeWhatsAppUrl,
  generalWhatsAppUrl,
  LOCATION,
  PHONE_PRIMARY,
  PHONE_SECONDARY,
  sellWhatsAppUrl,
} from "./lib/whatsapp";
import {
  fetchCars,
  fetchCarBySlug,
  type CarItem,
} from "./services/carService";
import AdminPanel from "./pages/AdminPanel";
import nitinGargImg from "./assets/founders/nitin-garg.png";
import ramanGargImg from "./assets/founders/raman-garg.png";

const heroImage =
  "https://images.pexels.com/photos/31574925/pexels-photo-31574925.jpeg?auto=compress&cs=tinysrgb&w=2000";

const navItems = [
  ["Cars", "/cars"],
  ["Buy", "/buy"],
  ["Sell", "/sell-your-car"],
  ["Exchange", "/exchange"],
  ["Finance", "/finance"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

function useScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}

function Shell({ children }: { children: React.ReactNode }) {
  useScrollTop();
  const { pathname } = useLocation();

  useEffect(() => {
    const pageName =
      pathname === "/admin-panel"
        ? "Car Management"
        : pathname === "/"
        ? "Trusted Used Cars in Himachal Pradesh"
        : pathname === "/cars"
        ? "Used Cars for Sale in Himachal Pradesh"
        : pathname.startsWith("/cars/")
        ? "Car Details | Himalyan Wheels"
        : pathname.includes("sell")
        ? "Sell Your Car | Himalyan Wheels"
        : pathname.includes("finance")
        ? "Car Finance Assistance | Himalyan Wheels"
        : pathname.includes("exchange")
        ? "Car Exchange | Himalyan Wheels"
        : pathname.includes("about")
        ? "About Himalyan Wheels"
        : pathname.includes("contact")
        ? "Contact Himalyan Wheels"
        : "Himalyan Wheels | Used Car Dealer in Himachal Pradesh";

    document.title = `${pageName} — Himalyan Wheels`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute(
      "content",
      "Himalyan Wheels is a trusted used car dealer in Solan, Himachal Pradesh. Buy, sell and exchange quality pre-owned cars with confidence."
    );
  }, [pathname]);

  const isAdmin = pathname === "/admin-panel";

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-ink-950 text-white">
      <Navbar />
      <main className="w-full max-w-full overflow-x-hidden">{children}</main>
      {!isAdmin && <FloatingContact />}
      <Footer />
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 w-full transition-all duration-500 ${
        scrolled || open
          ? "border-b border-white/10 bg-ink-950/90 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/50 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="group flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center border border-gold-400/70 text-gold-400">
            <Compass size={18} strokeWidth={1.5} />
          </span>
          <span className="display text-[13px] font-semibold tracking-[0.2em]">
            HIMALYAN<br />
            <span className="text-[9px] tracking-[0.4em] text-gold-400">
              WHEELS
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              className="text-[11px] font-medium tracking-wide text-white/65 transition hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <a
            href={generalWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 bg-gold-400 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-950 transition hover:bg-gold-300"
          >
            <MessageCircle size={14} /> WhatsApp Us
          </a>
        </div>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="text-white lg:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-ink-950 px-5 pb-7 pt-4 lg:hidden"
          >
            {navItems.map(([label, path], index) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  to={path}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-4 text-sm text-white/80"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
            <a
              href={generalWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center gap-2 bg-gold-400 py-3 text-xs font-bold uppercase tracking-widest text-ink-950"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function FloatingContact() {
  return (
    <>
      <a
        href={generalWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp Himalyan Wheels"
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/40 transition hover:scale-110 lg:bottom-7 lg:right-7"
      >
        <MessageCircle size={25} />
      </a>
      <div className="fixed bottom-0 left-0 z-40 grid w-full grid-cols-2 border-t border-white/10 bg-ink-900/95 backdrop-blur-lg sm:hidden">
        <a
          href={generalWhatsAppUrl()}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 border-r border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest text-[#48e07f]"
        >
          <MessageCircle size={15} /> WhatsApp
        </a>
        <a
          href="tel:+919805427094"
          className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-white"
        >
          <Phone size={14} /> Call
        </a>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950 px-5 pb-28 pt-16 sm:px-8 lg:px-12 lg:pb-12">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center border border-gold-400/60 text-gold-400">
              <Compass size={18} />
            </span>
            <span className="display text-xs font-semibold tracking-[0.2em]">
              HIMALYAN WHEELS
            </span>
          </div>
          <p className="max-w-xs text-sm leading-7 text-white/45">
            Buy. Sell. Exchange. Drive with Confidence. Your trusted automotive
            partner in the mountains.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-5">Explore</p>
          <div className="grid gap-3 text-sm text-white/55">
            {navItems.slice(0, 4).map(([label, path]) => (
              <Link key={path} to={path} className="transition hover:text-gold-300">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-5">Services</p>
          <div className="grid gap-3 text-sm text-white/55">
            <Link to="/buy-used-cars">Buy a Car</Link>
            <Link to="/sell-used-cars">Sell Your Car</Link>
            <Link to="/car-exchange">Car Exchange</Link>
            <Link to="/car-finance">Finance Assistance</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-5">Visit Us</p>
          <p className="mb-4 text-sm leading-6 text-white/55">{LOCATION}</p>
          <a href="tel:+919805427094" className="block text-sm text-white">
            {PHONE_PRIMARY}
          </a>
          <a href="tel:+918988080017" className="block text-sm text-white/55">
            {PHONE_SECONDARY}
          </a>
          <div className="mt-5 flex gap-3">
            <a
              href="https://instagram.com/himalyan_wheels"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="border border-white/15 p-2 text-white/60 transition hover:border-gold-400 hover:text-gold-400"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1440px] flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[10px] uppercase tracking-wider text-white/35 sm:flex-row">
        <span>© {new Date().getFullYear()} Himalyan Wheels. All Rights Reserved.</span>
        <a
          href="https://www.techhim.online/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-white/50 transition hover:text-gold-400"
        >
          <span>Powered by</span>
          <span className="font-semibold text-gold-400 underline underline-offset-4 decoration-gold-400/40 hover:text-gold-300">
            TechHim Solutions
          </span>
        </a>
        <span>Solan · Himachal Pradesh</span>
      </div>
    </footer>
  );
}

function Button({
  children,
  href,
  to,
  variant = "gold",
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  to?: string;
  variant?: "gold" | "outline";
  onClick?: () => void;
}) {
  const cls = `inline-flex items-center justify-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] transition ${
    variant === "gold"
      ? "bg-gold-400 text-ink-950 hover:bg-gold-300"
      : "border border-white/20 text-white hover:border-gold-400 hover:text-gold-300"
  }`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <a href={href} onClick={onClick} className={cls}>{children}</a>;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2
        className={`display text-balance text-3xl font-medium leading-[1.1] sm:text-5xl ${
          light ? "text-ink-950" : "text-white"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 max-w-lg text-sm leading-7 ${
            light ? "text-ink-500" : "text-white/50"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[760px] items-end overflow-hidden pb-20 pt-32 sm:min-h-[850px] sm:pb-28">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Black luxury SUV on a mountain road"
          className="h-full w-full object-cover object-center animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-ink-950/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/20" />
      </div>
      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="eyebrow mb-5"
          >
            Trusted used cars · Solan, Himachal Pradesh
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="display text-balance text-5xl font-medium leading-[0.98] sm:text-7xl lg:text-[92px]"
          >
            Find Your Next Car.<br />
            <span className="text-gold-300">Drive With Confidence.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-7 max-w-xl text-sm leading-7 text-white/65 sm:text-base"
          >
            Buy, sell or exchange quality pre-owned cars at competitive prices
            with flexible finance options.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button to="/cars">
              Explore Cars <ArrowUpRight size={15} />
            </Button>
            <Button href={generalWhatsAppUrl()} variant="outline">
              WhatsApp Us <MessageCircle size={15} />
            </Button>
            <a
              href="tel:+919805427094"
              className="flex items-center gap-2 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 transition hover:text-white"
            >
              <Phone size={15} /> Call Now
            </a>
          </motion.div>
        </div>
        <div className="mt-16 flex items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-white/40">
          <span className="h-10 w-px bg-gold-400" />
          <span>Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    [ShieldCheck, "Quality Checked Cars"],
    [Tag, "Best Market Prices"],
    [Landmark, "Finance Available"],
    [CarFront, "Buy · Sell · Exchange"],
    [MessageCircle, "WhatsApp Support"],
  ];
  return (
    <div className="relative z-10 -mt-1 border-y border-white/10 bg-ink-900/90">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-white/10 sm:grid-cols-3 lg:grid-cols-5">
        {items.map(([Icon, label]) => (
          <div
            key={label as string}
            className="flex items-center gap-3 px-5 py-5 text-[10px] font-semibold uppercase tracking-wider text-white/60 lg:justify-center"
          >
            <Icon size={17} className="shrink-0 text-gold-400" strokeWidth={1.5} />
            {label as string}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    ["100+", "Cars Dealt"],
    ["50+", "Happy Customers"],
    ["100%", "Transparent Deals"],
    ["24/7", "WhatsApp Assistance"],
  ];
  return (
    <section className="border-b border-white/10 bg-ink-900 px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-10 sm:grid-cols-4">
        {stats.map(([number, label], i) => (
          <Reveal key={label} delay={i * 0.08}>
            <div className="border-l border-gold-400/50 pl-5">
              <p className="display text-4xl font-medium text-white sm:text-5xl">{number}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.17em] text-white/40">{label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CarCard({ car }: { car: Car | CarItem }) {
  const isSold = car.status === "Sold";
  const firstImage = car.images && car.images[0] ? car.images[0] : heroImage;

  return (
    <article
      className={`group overflow-hidden border border-white/10 bg-ink-800 transition duration-500 hover:-translate-y-2 hover:border-gold-400/50 hover:shadow-2xl hover:shadow-black/30 ${
        isSold ? "opacity-75" : ""
      }`}
    >
      <Link to={`/cars/${car.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={firstImage}
          alt={`${car.brand} ${car.model} ${car.variant || ""}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {isSold ? (
          <span className="absolute left-4 top-4 bg-zinc-800/90 border border-zinc-600 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-300">
            Sold
          </span>
        ) : car.featured ? (
          <span className="absolute left-4 top-4 bg-gold-400 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-ink-950">
            Featured
          </span>
        ) : "badge" in car && car.badge ? (
          <span className="absolute left-4 top-4 bg-gold-400 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-ink-950">
            {car.badge}
          </span>
        ) : null}
        <span className="absolute bottom-4 left-4 flex items-center gap-1 text-[10px] text-white/70">
          <MapPinIcon /> {car.location || "Solan, HP"}
        </span>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gold-400">{car.brand}</p>
            <h3 className="display mt-1 text-xl text-white">
              {car.model} <span className="text-white/50">{car.variant}</span>
            </h3>
          </div>
          <p className="text-right text-sm font-semibold text-white">{formatPrice(car.price)}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-[10px] uppercase tracking-wider text-white/45">
          <span>{car.year}</span>
          <span>{car.fuel}</span>
          <span>{car.transmission}</span>
          <span>{car.kmDriven.toLocaleString("en-IN")} KM</span>
        </div>
        <div className="mt-5 flex gap-2">
          <Button to={`/cars/${car.slug}`} variant="outline">
            View Details
          </Button>
          <a
            href={carWhatsAppUrl(`${car.brand} ${car.model} ${car.variant || ""} ${car.year}`)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Enquire about ${car.model}`}
            className="flex flex-1 items-center justify-center gap-2 border border-gold-400/50 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gold-300 transition hover:bg-gold-400 hover:text-ink-950"
          >
            <MessageCircle size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

function MapPinIcon() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" />;
}

function FeaturedCars({ cars, isLive }: { cars: CarItem[]; isLive: boolean }) {
  const displayList = useMemo(() => {
    if (isLive) {
      const available = cars.filter((c) => c.status !== "Sold");
      const featured = available.filter((c) => c.featured);
      return (featured.length > 0 ? featured : available).slice(0, 3);
    }
    return cars.slice(0, 3);
  }, [cars, isLive]);

  return (
    <section className="bg-ink-950 px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="The collection"
            title="Cars worth driving home."
            description="Explore quality pre-owned cars available with Himalyan Wheels."
          />
          <Button to="/cars" variant="outline">
            View All Cars <ArrowUpRight size={15} />
          </Button>
        </div>
        {displayList.length > 0 ? (
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayList.map((car, i) => (
              <Reveal key={car.id} delay={i * 0.1}>
                <CarCard car={car} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-14 border border-white/10 p-12 text-center text-white/50 text-sm">
            No cars currently featured.
          </div>
        )}
        {!isLive && (
          <div className="mt-6 border border-gold-400/20 bg-gold-400/[0.04] px-5 py-3 text-center text-[10px] uppercase tracking-wider text-gold-300/80">
            Demo listings shown for development · Connect MongoDB & Cloudinary in /admin-panel for live inventory
          </div>
        )}
      </div>
    </section>
  );
}

function WhyChoose() {
  const items = [
    [ShieldCheck, "Quality Cars", "Carefully selected pre-owned vehicles."],
    [CircleCheck, "Transparent Deals", "Clear pricing and straightforward communication."],
    [BarChart3, "Best Value", "Competitive pricing based on market value."],
    [Landmark, "Finance Assistance", "Support with available finance options."],
    [CarFront, "Buy · Sell · Exchange", "Complete vehicle solutions under one roof."],
    [Compass, "Local Trust", "Serving customers in Solan and across Himachal Pradesh."],
  ];
  return (
    <section className="bg-[#eee9df] px-5 py-24 text-ink-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeading
          eyebrow="The Himalyan standard"
          title="More than a car. A better way to move forward."
          description="A customer-first experience built around clarity, care and confidence — from the first WhatsApp to the keys in your hand."
          light
        />
        <div className="mt-14 grid gap-px border border-ink-950/10 bg-ink-950/10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([Icon, title, copy], i) => (
            <Reveal key={title as string} delay={i * 0.05}>
              <div className="group bg-[#eee9df] p-7 transition hover:bg-white">
                <Icon
                  size={25}
                  strokeWidth={1.4}
                  className="text-gold-600 transition group-hover:scale-110"
                />
                <h3 className="display mt-6 text-lg font-medium">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">{copy as string}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "Choose", "Find a car that fits your needs."],
    ["02", "Inspect", "Review vehicle details and condition."],
    ["03", "Connect", "Talk directly with Himalyan Wheels."],
    ["04", "Finance", "Explore available financing assistance."],
    ["05", "Drive", "Complete the paperwork and drive away."],
  ];
  return (
    <section className="bg-ink-900 px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeading
          eyebrow="Simple by design"
          title="From browsing to belonging."
          description="A clear, guided journey without the usual dealership pressure."
        />
        <div className="mt-16 grid gap-8 md:grid-cols-5">
          {steps.map(([number, title, copy], i) => (
            <Reveal key={number} delay={i * 0.08}>
              <div className="relative border-t border-gold-400/50 pt-5">
                <span className="display text-3xl text-gold-400/70">{number}</span>
                <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{copy}</p>
                {i < 4 && (
                  <span className="absolute right-0 top-[-4px] hidden text-gold-400/50 md:block">
                    →
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinanceCTA() {
  return (
    <section className="relative overflow-hidden bg-gold-400 px-5 py-20 text-ink-950 sm:px-8 lg:px-12">
      <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full border-[60px] border-ink-950/5" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow !text-ink-700">Make it yours</p>
          <h2 className="display mt-3 max-w-2xl text-3xl font-medium leading-tight sm:text-5xl">
            Drive now. Pay with flexible finance options.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-ink-700">
            Finance assistance available for eligible customers, with documentation support throughout
            the process.
          </p>
        </div>
        <Button href={financeWhatsAppUrl()} variant="outline">
          Check Finance Options <ArrowUpRight size={15} />
        </Button>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-ink-950 px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Customer notes" title="Trust, in their words." />
          <span className="hidden text-2xl tracking-[0.18em] text-gold-400 sm:block">★★★★★</span>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            ["Very smooth experience and genuine guidance while buying the car.", "Aarav Mehta", "Solan, Himachal Pradesh"],
            ["They made the exchange process feel simple and transparent. Highly recommended.", "Kavya Thakur", "Shimla, Himachal Pradesh"],
            ["The team understood what we needed and helped us find the right fit for our family.", "Rohit Sharma", "Kandaghat, Himachal Pradesh"],
          ].map(([quote, name, place], i) => (
            <Reveal key={name} delay={i * 0.1}>
              <div className="border border-white/10 bg-ink-800 p-7">
                <p className="text-2xl tracking-[0.1em] text-gold-400">★★★★★</p>
                <p className="mt-6 text-base leading-7 text-white/75">“{quote}”</p>
                <div className="mt-8 border-t border-white/10 pt-5">
                  <p className="text-xs font-semibold text-white">{name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">{place}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramSection() {
  return (
    <section className="bg-[#eee9df] px-5 py-24 text-ink-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow !text-gold-700">Behind the wheel</p>
            <h2 className="display mt-4 text-3xl font-medium sm:text-5xl">Follow the journey.</h2>
            <p className="mt-4 text-sm text-ink-500">@himalyan_wheels</p>
          </div>
          <a
            href="https://instagram.com/himalyan_wheels"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink-950 underline decoration-gold-500 underline-offset-8"
          >
            Follow us on Instagram <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            "https://images.pexels.com/photos/31574907/pexels-photo-31574907.jpeg?auto=compress&cs=tinysrgb&w=700",
            "https://images.pexels.com/photos/31574911/pexels-photo-31574911.jpeg?auto=compress&cs=tinysrgb&w=700",
            "https://images.pexels.com/photos/31574915/pexels-photo-31574915.jpeg?auto=compress&cs=tinysrgb&w=700",
            "https://images.pexels.com/photos/31574920/pexels-photo-31574920.jpeg?auto=compress&cs=tinysrgb&w=700",
          ].map((src, i) => (
            <div
              key={src}
              className={`aspect-square overflow-hidden ${i === 1 ? "sm:translate-y-8" : ""}`}
            >
              <img
                src={src}
                alt="Himalyan Wheels automotive gallery"
                loading="lazy"
                className="h-full w-full object-cover grayscale transition duration-700 hover:scale-105 hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationSection() {
  return (
    <section className="bg-ink-900 px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading
            eyebrow="Come say hello"
            title="Visit Himalyan Wheels."
            description="A trusted local dealership in the heart of Himachal, ready to help you find your next drive."
          />
          <div className="mt-10 space-y-5 text-sm text-white/60">
            <p className="flex gap-3">
              <Compass className="shrink-0 text-gold-400" size={18} />
              {LOCATION}
            </p>
            <p className="flex gap-3">
              <Phone className="shrink-0 text-gold-400" size={18} />
              {PHONE_PRIMARY}
              <br />
              {PHONE_SECONDARY}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={generalWhatsAppUrl()}>
              WhatsApp Us <MessageCircle size={15} />
            </Button>
            <Button href="tel:+919805427094" variant="outline">
              Call Now <Phone size={15} />
            </Button>
          </div>
        </div>
        <div className="min-h-[340px] overflow-hidden border border-white/10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3418.560962164945!2d77.04089731077525!3d31.03847957137804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sParihar%20Niwas%20Kandaghat%2022QX%2B463!5e0!3m2!1sen!2sin!4v1788931306042!5m2!1sen!2sin"
            width="600"
            height="450"
            style={{ border: 0, filter: "grayscale(1) contrast(1.1)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Himalyan Wheels location map"
            className="h-full min-h-[340px] w-full"
          />
        </div>
      </div>
    </section>
  );
}

function Home({ cars, isLive }: { cars: CarItem[]; isLive: boolean }) {
  return (
    <>
      <Hero />
      <TrustBar />
      <Stats />
      <FeaturedCars cars={cars} isLive={isLive} />
      <WhyChoose />
      <HowItWorks />
      <FinanceCTA />
      <Testimonials />
      <InstagramSection />
      <LocationSection />
    </>
  );
}

function PageHero({
  eyebrow,
  title,
  copy,
  image = heroImage,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  image?: string;
}) {
  return (
    <section className="relative flex min-h-[360px] sm:min-h-[460px] items-end overflow-hidden pb-12 pt-28 sm:pb-16 sm:pt-32 w-full max-w-full">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 min-w-0">
        <p className="eyebrow mb-4 sm:mb-5">{eyebrow}</p>
        <h1 className="display max-w-4xl text-3xl font-medium leading-[1.05] sm:text-5xl lg:text-7xl break-words">
          {title}
        </h1>
        <p className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-sm leading-6 sm:leading-7 text-white/60 break-words">{copy}</p>
      </div>
    </section>
  );
}

function CarsPage({
  cars,
  loading,
  isLive,
}: {
  cars: CarItem[];
  loading: boolean;
  isLive: boolean;
}) {
  const [query, setQuery] = useState("");
  const [fuel, setFuel] = useState("All fuel");
  const [sort, setSort] = useState("Newest");

  const filtered = useMemo(() => {
    let result = cars.filter(
      (c) =>
        `${c.brand} ${c.model} ${c.variant || ""}`.toLowerCase().includes(query.toLowerCase()) &&
        (fuel === "All fuel" || c.fuel.toLowerCase() === fuel.toLowerCase())
    );
    return [...result].sort((a, b) =>
      sort === "Price Low → High"
        ? a.price - b.price
        : sort === "Price High → Low"
        ? b.price - a.price
        : sort === "KM Driven"
        ? a.kmDriven - b.kmDriven
        : (b.year || 0) - (a.year || 0)
    );
  }, [cars, query, fuel, sort]);

  return (
    <>
      <PageHero
        eyebrow="The collection"
        title="Find a car that feels like yours."
        copy="Explore our curated selection of pre-owned cars. Verified documentation, quality checks, and transparent mountain driving assurance."
      />
      <section className="bg-ink-950 px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-3 border border-white/10 bg-ink-900 p-3 md:flex-row">
            <div className="flex flex-1 items-center gap-3 border-b border-white/10 px-3 py-2 md:border-b-0 md:border-r">
              <Search size={17} className="text-white/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your dream car..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              className="bg-ink-900 px-3 py-2 text-xs text-white/60 outline-none cursor-pointer"
            >
              <option>All fuel</option>
              <option>Diesel</option>
              <option>Petrol</option>
              <option>CNG</option>
              <option>Electric</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-ink-900 px-3 py-2 text-xs text-white/60 outline-none cursor-pointer"
            >
              <option>Newest</option>
              <option>Price Low → High</option>
              <option>Price High → Low</option>
              <option>KM Driven</option>
            </select>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-white/45">
              <span className="text-white font-medium">{filtered.length}</span> vehicles found
            </p>
            {isLive ? (
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Inventory
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-widest text-gold-400">
                Sample inventory
              </span>
            )}
          </div>

          {loading ? (
            <div className="mt-16 text-center py-20 border border-white/10">
              <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-white/40 mt-3">Loading available cars...</p>
            </div>
          ) : filtered.length ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((car, i) => (
                <Reveal key={car.id} delay={i * 0.04}>
                  <CarCard car={car} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-white/10 py-20 text-center">
              <CarFront className="mx-auto text-gold-400" size={32} />
              <h3 className="display mt-5 text-2xl text-white">No cars found</h3>
              <p className="mt-2 text-sm text-white/45">Try changing your filters.</p>
              <a
                href={generalWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-300"
              >
                Talk to Himalyan Wheels <ArrowUpRight size={14} />
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function CarDetailPage({ cars }: { cars: CarItem[] }) {
  const { slug } = useParams();
  const [asyncCar, setAsyncCar] = useState<CarItem | null>(null);
  const [loadingAsync, setLoadingAsync] = useState(false);

  const carFromList = useMemo(() => {
    return cars.find((c) => c.slug === slug || c.id === slug);
  }, [cars, slug]);

  useEffect(() => {
    if (!carFromList && slug) {
      setLoadingAsync(true);
      fetchCarBySlug(slug)
        .then((res) => {
          setAsyncCar(res);
        })
        .catch((err) => {
          console.warn("Direct car fetch error:", err);
        })
        .finally(() => {
          setLoadingAsync(false);
        });
    }
  }, [carFromList, slug]);

  const car = carFromList || asyncCar;
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    setActiveImage(0);
  }, [car?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setActiveImage((prev) => (prev + (car?.images?.length || 1) - 1) % (car?.images?.length || 1));
      if (e.key === "ArrowRight") setActiveImage((prev) => (prev + 1) % (car?.images?.length || 1));
    };
    if (lightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, car?.images?.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45 && images.length > 1) {
      setActiveImage((prev) => (prev + 1) % images.length);
    } else if (diff < -45 && images.length > 1) {
      setActiveImage((prev) => (prev + images.length - 1) % images.length);
    }
    setTouchStart(null);
  };

  if (loadingAsync) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-ink-950 px-5 pt-24 text-center">
        <div className="w-7 h-7 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-white/40 mt-3">Loading vehicle details...</p>
      </section>
    );
  }

  if (!car) return <NotFound />;

  const images = car.images && car.images.length > 0 ? car.images : [heroImage];
  const related = cars.filter((c) => c.id !== car.id).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={`${car.brand} · ${car.year}`}
        title={`${car.model} ${car.variant || ""}`}
        copy={car.description || "Carefully inspected pre-owned car with verified history."}
        image={images[0]}
      />
      <section className="bg-ink-950 px-4 py-10 sm:px-8 sm:py-16 lg:px-12 w-full max-w-full overflow-hidden">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0">
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl flex items-center justify-center select-none"
            >
              {/* Ambient blurred backdrop so any aspect ratio fills the frame elegantly */}
              <img
                src={images[activeImage] || images[0]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Main Car Photo - object-contain ensures the entire car is 100% visible, no cutting */}
              <img
                src={images[activeImage] || images[0]}
                alt={`${car.brand} ${car.model}`}
                onClick={() => setLightboxOpen(true)}
                className="relative z-10 max-h-full max-w-full object-contain cursor-zoom-in transition-all duration-300"
              />

              {/* Image Counter Badge */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md border border-white/10">
                  <span>{activeImage + 1}</span>
                  <span className="text-white/40">/</span>
                  <span>{images.length}</span>
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={() => setLightboxOpen(true)}
                aria-label="View fullscreen photo"
                className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-md border border-white/10 hover:bg-black/90 hover:text-gold-400 transition"
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage((activeImage + images.length - 1) % images.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/65 p-2.5 text-white hover:bg-black/90 hover:text-gold-400 transition border border-white/10 backdrop-blur-sm"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/65 p-2.5 text-white hover:bg-black/90 hover:text-gold-400 transition border border-white/10 backdrop-blur-sm"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-2 pt-1 min-w-0">
                {images.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-20 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-lg border-2 bg-ink-900 transition-all ${
                      activeImage === i
                        ? "border-gold-400 ring-2 ring-gold-400/30 scale-[1.02]"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="border-b border-white/10 pb-7">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                    car.status === "Available"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {car.status}
                </span>
                {car.featured && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-gold-400 text-ink-950 px-2 py-0.5">
                    Featured
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-start justify-between gap-5">
                <div>
                  <h2 className="display text-3xl text-white">
                    {car.brand} {car.model}
                  </h2>
                  <p className="mt-1 text-sm text-white/45">{car.variant}</p>
                </div>
                <p className="text-xl font-semibold text-gold-300">{formatPrice(car.price)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px border-b border-white/10 bg-white/10 py-7">
              <Spec icon={Gauge} label="Year" value={String(car.year)} />
              <Spec
                icon={Gauge}
                label="KM Driven"
                value={`${car.kmDriven.toLocaleString("en-IN")} km`}
              />
              <Spec icon={Fuel} label="Fuel" value={car.fuel} />
              <Spec icon={Zap} label="Transmission" value={car.transmission} />
            </div>
            {car.description && (
              <p className="mt-7 text-sm leading-7 text-white/55">{car.description}</p>
            )}
            {car.features && car.features.length > 0 && (
              <div className="mt-8">
                <p className="eyebrow mb-4">Highlights</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {car.features.map((feature) => (
                    <span key={feature} className="flex items-center gap-2 text-xs text-white/65">
                      <Check size={14} className="text-gold-400 shrink-0" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                href={carWhatsAppUrl(
                  `${car.brand} ${car.model} ${car.variant || ""} ${car.year}`
                )}
              >
                WhatsApp Enquiry <MessageCircle size={15} />
              </Button>
              <Button href="tel:+919805427094" variant="outline">
                Call Now <Phone size={15} />
              </Button>
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="bg-ink-900 px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading eyebrow="You may also like" title="More to explore." />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {related.map((rel) => (
                <CarCard key={rel.id} car={rel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-4 backdrop-blur-xl">
          <div className="flex w-full max-w-6xl items-center justify-between py-2 text-white">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/80">
              {car.brand} {car.model} · Photo {activeImage + 1} of {images.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 hover:text-gold-400 transition"
              aria-label="Close fullscreen"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative flex flex-1 w-full max-w-6xl items-center justify-center overflow-hidden my-auto">
            <img
              src={images[activeImage] || images[0]}
              alt={`${car.brand} ${car.model}`}
              className="max-h-[75vh] sm:max-h-[82vh] max-w-full object-contain select-none"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImage((activeImage + images.length - 1) % images.length)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/75 p-3 text-white hover:bg-black hover:text-gold-400 transition border border-white/20 backdrop-blur-md"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => setActiveImage((activeImage + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/75 p-3 text-white hover:bg-black hover:text-gold-400 transition border border-white/20 backdrop-blur-md"
                  aria-label="Next photo"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto py-2 max-w-full min-w-0">
            {images.map((img, i) => (
              <button
                key={`modal-${img}-${i}`}
                onClick={() => setActiveImage(i)}
                className={`h-12 w-16 sm:h-16 sm:w-24 shrink-0 overflow-hidden rounded-md border-2 transition ${
                  activeImage === i ? "border-gold-400 opacity-100 ring-2 ring-gold-400/40" : "border-white/10 opacity-40 hover:opacity-80"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-ink-950 py-4">
      <Icon size={16} className="text-gold-400" />
      <p className="mt-2 text-[9px] uppercase tracking-wider text-white/35">{label}</p>
      <p className="mt-1 text-xs text-white/75">{value}</p>
    </div>
  );
}

function ActionPage({ type }: { type: "buy" | "exchange" | "finance" }) {
  const data = {
    buy: {
      eyebrow: "Buy with confidence",
      title: "Looking for your next car?",
      copy: "Find a quality pre-owned car with honest guidance, transparent pricing and support that continues after the keys are yours.",
      cta: "Browse Available Cars",
      to: "/cars",
      image: heroImage,
      points: [
        "Quality used cars",
        "Transparent pricing",
        "Multiple brands",
        "Finance assistance",
        "Personal guidance",
        "Easy documentation",
      ],
    },
    exchange: {
      eyebrow: "Make the next move",
      title: "Upgrade your drive with easy car exchange.",
      copy: "Bring us your current car and discover a simpler way to move into the one you really want.",
      cta: "Start Exchange on WhatsApp",
      to: exchangeWhatsAppUrl(),
      image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=1600",
      points: [
        "Share your car",
        "Vehicle evaluation",
        "Get exchange value",
        "Choose your next car",
        "Complete documentation",
      ],
    },
    finance: {
      eyebrow: "Make it possible",
      title: "Drive now. Pay with flexible finance options.",
      copy: "Finance assistance available for eligible customers. We help you understand the process and paperwork without the jargon.",
      cta: "Check Finance Options",
      to: financeWhatsAppUrl(),
      image: "https://images.pexels.com/photos/104401/pexels-photo-104401.jpeg?auto=compress&cs=tinysrgb&w=1600",
      points: [
        "Easy finance assistance",
        "Documentation support",
        "Flexible repayment options",
        "Quick processing",
        "Support throughout",
      ],
    },
  }[type];

  return (
    <>
      <PageHero eyebrow={data.eyebrow} title={data.title} copy={data.copy} image={data.image} />
      <section className="bg-ink-950 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="Built around you"
              title={
                type === "exchange"
                  ? "A clearer way to exchange."
                  : type === "finance"
                  ? "Support at every step."
                  : "The right car, without the guesswork."
              }
              description="A calm, personal and transparent experience from the first conversation to the final paperwork."
            />
            <Button href={data.to} to={type === "buy" ? data.to : undefined}>
              {data.cta} <ArrowUpRight size={15} />
            </Button>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {data.points.map((point, i) => (
              <div key={point} className="bg-ink-900 p-7">
                <span className="display text-3xl text-gold-400/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-6 text-sm font-semibold text-white">{point}</p>
                <p className="mt-2 text-xs leading-5 text-white/40">
                  Thoughtful support designed around your needs.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FinanceCTA />
    </>
  );
}

function SellPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    year: "",
    km: "",
    fuel: "",
    price: "",
    message: "",
  });
  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  const details = Object.entries(form)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return (
    <>
      <PageHero
        eyebrow="Sell with clarity"
        title="Want to sell your car?"
        copy="Get a fair market evaluation and a hassle-free selling experience, backed by real local guidance."
      />
      <section className="bg-ink-950 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <SectionHeading
              eyebrow="Your car has a next chapter"
              title="Tell us about your drive."
              description="Share a few details and our team will take it from there on WhatsApp."
            />
            <div className="mt-10 space-y-4 text-sm text-white/55">
              <p className="flex gap-3">
                <BadgeCheck className="text-gold-400" size={18} />
                Fair, market-aware evaluation
              </p>
              <p className="flex gap-3">
                <BadgeCheck className="text-gold-400" size={18} />
                Hassle-free documentation
              </p>
              <p className="flex gap-3">
                <BadgeCheck className="text-gold-400" size={18} />
                Personal assistance throughout
              </p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.open(sellWhatsAppUrl(details), "_blank", "noopener,noreferrer");
            }}
            className="grid gap-4 border border-white/10 bg-ink-900 p-5 sm:grid-cols-2 sm:p-8"
          >
            {[
              ["name", "Name"],
              ["phone", "Phone"],
              ["brand", "Car Brand"],
              ["model", "Car Model"],
              ["year", "Year"],
              ["km", "KM Driven"],
              ["fuel", "Fuel Type"],
              ["price", "Expected Price"],
            ].map(([key, label]) => (
              <label key={key} className="text-[10px] uppercase tracking-wider text-white/45">
                {label}
                <input
                  required={key === "name" || key === "phone"}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => update(key as keyof typeof form, e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-ink-950 px-3 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-gold-400"
                />
              </label>
            ))}
            <label className="text-[10px] uppercase tracking-wider text-white/45 sm:col-span-2">
              Message
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none border border-white/10 bg-ink-950 px-3 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-gold-400"
              />
            </label>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-gold-400 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-950 transition hover:bg-gold-300 sm:col-span-2"
            >
              Get Car Valuation on WhatsApp <MessageCircle size={16} />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Driven by trust. Built for the mountains."
        copy="Himalyan Wheels is a used-car dealership based in Solan, Himachal Pradesh, focused on helping customers buy, sell and exchange quality pre-owned cars with a transparent, customer-first approach."
      />
      <section className="bg-[#eee9df] px-5 py-24 text-ink-950 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <SectionHeading
            eyebrow="Meet the people"
            title="A local team with a long view."
            description="We believe the best dealership experience feels less like a transaction and more like good advice from someone who knows the road."
            light
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              { name: "Nitin Garg", role: "Co-Founder", image: nitinGargImg },
              { name: "Raman Garg", role: "Co-Founder", image: ramanGargImg },
            ].map(({ name, role, image }) => (
              <div key={name} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-900 shadow-2xl border border-white/10">
                <img
                  src={image}
                  alt={`${name} — ${role} at Himalyan Wheels`}
                  className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="eyebrow">{role}</p>
                  <h3 className="display mt-1.5 text-2xl font-medium text-white">{name}</h3>
                  <p className="mt-1 text-xs text-white/60">Himalyan Wheels</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WhyChoose />
      <LocationSection />
    </>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHero
        eyebrow="Start a conversation"
        title="Let's find your next move."
        copy="Whether you are buying, selling, exchanging or simply exploring your options, we are here to help."
      />
      <section className="bg-ink-950 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionHeading eyebrow="Contact us" title="Good questions deserve good answers." />
            <div className="mt-10 space-y-6 text-sm text-white/60">
              <a href="tel:+919805427094" className="flex gap-4">
                <Phone className="text-gold-400" size={19} />
                <span>
                  {PHONE_PRIMARY}
                  <br />
                  <span className="text-white/40">Primary line</span>
                </span>
              </a>
              <a href="tel:+918988080017" className="flex gap-4">
                <Phone className="text-gold-400" size={19} />
                <span>
                  {PHONE_SECONDARY}
                  <br />
                  <span className="text-white/40">Alternate line</span>
                </span>
              </a>
              <p className="flex gap-4">
                <Compass className="text-gold-400" size={19} />
                {LOCATION}
              </p>
            </div>
          </div>
          {sent ? (
            <div className="flex flex-col items-center justify-center border border-gold-400/30 bg-gold-400/[0.06] p-10 text-center">
              <CircleCheck size={42} className="text-gold-400" />
              <h3 className="display mt-5 text-2xl text-white">Opening WhatsApp</h3>
              <p className="mt-3 text-sm text-white/50">Your enquiry is ready to send.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                window.open(generalWhatsAppUrl(), "_blank", "noopener,noreferrer");
              }}
              className="grid gap-4 border border-white/10 bg-ink-900 p-5 sm:grid-cols-2 sm:p-8"
            >
              <label className="text-[10px] uppercase tracking-wider text-white/45">
                Name
                <input
                  required
                  className="mt-2 w-full border border-white/10 bg-ink-950 px-3 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-gold-400"
                />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/45">
                Phone
                <input
                  required
                  type="tel"
                  className="mt-2 w-full border border-white/10 bg-ink-950 px-3 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-gold-400"
                />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/45 sm:col-span-2">
                I'm interested in
                <select className="mt-2 w-full border border-white/10 bg-ink-950 px-3 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-gold-400">
                  <option>Buying a Car</option>
                  <option>Selling My Car</option>
                  <option>Car Exchange</option>
                  <option>Finance</option>
                  <option>General Enquiry</option>
                </select>
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/45 sm:col-span-2">
                Message
                <textarea
                  rows={5}
                  className="mt-2 w-full resize-none border border-white/10 bg-ink-950 px-3 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-gold-400"
                />
              </label>
              <button className="flex items-center justify-center gap-2 bg-gold-400 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-950 sm:col-span-2">
                Send Enquiry <MessageCircle size={15} />
              </button>
            </form>
          )}
        </div>
      </section>
      <LocationSection />
    </>
  );
}

function LocalPage({ location }: { location: string }) {
  return (
    <>
      <PageHero
        eyebrow={`Used cars in ${location}`}
        title={`Your next car is closer than you think.`}
        copy={`Looking for used cars in ${location}? Himalyan Wheels helps customers across Himachal Pradesh buy, sell and exchange quality pre-owned vehicles from our base in Solan.`}
      />
      <section className="bg-ink-950 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <SectionHeading
            eyebrow={`Serving ${location} and beyond`}
            title="A trusted local partner for the road ahead."
            description={`From ${location} to Solan and the wider Himachal region, our team offers a calm, transparent way to explore quality pre-owned cars. Visit us, call or start on WhatsApp.`}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              [CarFront, "Browse Cars", "Explore our collection and tell us what you are looking for."],
              [MessageCircle, "Talk to Us", "Get personal guidance over WhatsApp from our local team."],
              [Compass, "Visit Solan", "Find us at Neri, Mamligh for a closer look and a proper conversation."],
            ].map(([Icon, title, copy]) => (
              <div key={title as string} className="border border-white/10 bg-ink-900 p-7">
                <Icon size={24} className="text-gold-400" />
                <h3 className="display mt-6 text-lg text-white">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{copy as string}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/cars">
              Explore Cars <ArrowUpRight size={15} />
            </Button>
            <Button href={generalWhatsAppUrl()} variant="outline">
              WhatsApp Us <MessageCircle size={15} />
            </Button>
          </div>
        </div>
      </section>
      <LocationSection />
    </>
  );
}

function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-ink-950 px-5 pt-24 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-5 text-5xl text-white">That road ends here.</h1>
        <p className="mt-4 text-sm text-white/45">The page you are looking for has moved.</p>
        <Button to="/" variant="outline">
          Back to home <ArrowUpRight size={15} />
        </Button>
      </div>
    </section>
  );
}

function App() {
  // Global live cars state for the public site
  const [liveCars, setLiveCars] = useState<CarItem[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const data = await fetchCars();
        if (mounted) {
          if (data && data.length > 0) {
            setLiveCars(data);
            setIsLive(true);
          } else {
            setLiveCars([]);
            setIsLive(false);
          }
          setLoadingCars(false);
        }
      } catch (err) {
        console.warn("Could not load cars from MongoDB, using sample fallback:", err);
        if (mounted) {
          setLoadingCars(false);
          setIsLive(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const displayCars = useMemo(() => {
    if (isLive && liveCars.length > 0) {
      return liveCars;
    }
    return sampleCars as unknown as CarItem[];
  }, [isLive, liveCars]);

  const localPages: Record<string, string> = {
    "/used-cars-in-solan": "Solan",
    "/used-cars-in-shimla": "Shimla",
    "/used-cars-in-kandaghat": "Kandaghat",
    "/used-cars-in-kasauli": "Kasauli",
    "/used-cars-in-chail": "Chail",
    "/used-cars-in-bilaspur": "Bilaspur",
    "/used-cars-in-mandi": "Mandi",
    "/used-cars-in-kullu": "Kullu",
    "/used-cars-in-manali": "Manali",
    "/used-cars-in-hamirpur": "Hamirpur",
    "/used-cars-in-una": "Una",
    "/used-cars-in-sirmaur": "Sirmaur",
    "/used-cars-in-kangra": "Kangra",
    "/used-cars-in-dharamshala": "Dharamshala",
  };

  return (
    <Shell>
      <Routes>
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/" element={<Home cars={displayCars} isLive={isLive} />} />
        <Route
          path="/cars"
          element={<CarsPage cars={displayCars} loading={loadingCars} isLive={isLive} />}
        />
        <Route path="/cars/:slug" element={<CarDetailPage cars={displayCars} />} />
        <Route path="/buy" element={<ActionPage type="buy" />} />
        <Route path="/sell-your-car" element={<SellPage />} />
        <Route path="/exchange" element={<ActionPage type="exchange" />} />
        <Route path="/finance" element={<ActionPage type="finance" />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/buy-used-cars" element={<ActionPage type="buy" />} />
        <Route path="/sell-used-cars" element={<SellPage />} />
        <Route path="/car-exchange" element={<ActionPage type="exchange" />} />
        <Route path="/car-finance" element={<ActionPage type="finance" />} />
        <Route path="/used-car-dealer" element={<LocalPage location="Himachal Pradesh" />} />
        <Route path="/second-hand-cars" element={<LocalPage location="Himachal Pradesh" />} />
        {Object.entries(localPages).map(([path, location]) => (
          <Route key={path} path={path} element={<LocalPage location={location} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}

export default App;
