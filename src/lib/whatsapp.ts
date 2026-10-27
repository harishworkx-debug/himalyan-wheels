export const WHATSAPP_NUMBER = "919805427094";
export const PHONE_PRIMARY = "+91 98054 27094";
export const PHONE_SECONDARY = "+91 89880 80017";
export const LOCATION = "Neri, Mamligh, Solan, Himachal Pradesh 173207, India";

export const createWhatsAppUrl = (message: string): string => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
export const generalWhatsAppUrl = (): string => createWhatsAppUrl("Hi Himalyan Wheels, I would like to know more about your used cars.");
export const sellWhatsAppUrl = (details = ""): string => createWhatsAppUrl(`Hi Himalyan Wheels, I want to sell my car. Please help me with the valuation.${details ? `\n\n${details}` : ""}`);
export const exchangeWhatsAppUrl = (): string => createWhatsAppUrl("Hi Himalyan Wheels, I am interested in exchanging my car.");
export const financeWhatsAppUrl = (): string => createWhatsAppUrl("Hi Himalyan Wheels, I would like to check the available finance options.");
export const carWhatsAppUrl = (name: string): string => createWhatsAppUrl(`Hi Himalyan Wheels, I am interested in the ${name}. Please share more details.`);
