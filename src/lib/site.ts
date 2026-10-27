export const site = {
  name: "Himalyan Wheels",
  tagline: "Buy. Sell. Exchange. Drive with Confidence.",
  instagram: "https://www.instagram.com/himalyan_wheels",
  instagramHandle: "@himalyan_wheels",
  address: {
    street: "Neri, Mamligh",
    city: "Solan",
    state: "Himachal Pradesh",
    postalCode: "173207",
    country: "India",
  },
  addressLine: "Neri, Mamligh, Solan, Himachal Pradesh 173207, India",
  mapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=Neri%2C%20Mamligh%2C%20Solan%2C%20Himachal%20Pradesh%20173207",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3418.560962164945!2d77.04089731077525!3d31.03847957137804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sParihar%20Niwas%20Kandaghat%2022QX%2B463!5e0!3m2!1sen!2sin!4v1788931306042!5m2!1sen!5e0!3m2!1sen!2sin",
} as const;

export const phones = [
  { display: "+91 98054 27094", tel: "+919805427094", wa: "919805427094" },
  { display: "+91 89880 80017", tel: "+918988080017", wa: "919805427094" },
] as const;

export const primaryPhone = phones[0];

export function waLink(message: string, index: 0 | 1 = 0) {
  return `https://wa.me/${phones[index].wa}?text=${encodeURIComponent(message)}`;
}

export const waMessages = {
  general: "Hi Himalyan Wheels, I would like to know more about your used cars.",
  buy: "Hi Himalyan Wheels, I am looking to buy a used car. Please help me.",
  sell: "Hi Himalyan Wheels, I want to sell my car. Please help me with the valuation.",
  exchange: "Hi Himalyan Wheels, I am interested in exchanging my car.",
  finance: "Hi Himalyan Wheels, I would like to check the finance options available.",
  car: (name: string) =>
    `Hi Himalyan Wheels, I am interested in the ${name}. Please share more details.`,
  location: (place: string) =>
    `Hi Himalyan Wheels, I am from ${place} and I am looking for a used car. Please share options.`,
};

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "Cars", to: "/cars" },
  { label: "Buy", to: "/buy" },
  { label: "Sell", to: "/sell-your-car" },
  { label: "Exchange", to: "/exchange" },
  { label: "Finance", to: "/finance" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function formatPrice(lakh: number) {
  return `₹${lakh.toFixed(2)} Lakh`;
}

export function formatKm(km: number) {
  return `${km.toLocaleString("en-IN")} KM`;
}
