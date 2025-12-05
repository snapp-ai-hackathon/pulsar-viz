export const SERVICE_TYPES = [
  { id: 1, name: "Eco", nameFA: "اکو" },
  { id: 2, name: "Plus", nameFA: "پلاس" },
  { id: 3, name: "Rose", nameFA: "رز" },
  { id: 4, name: "Yellow", nameFA: "زرد" },
  { id: 5, name: "Delivery", nameFA: "دلیوری" },
  { id: 6, name: "Eat", nameFA: "ایت" },
  { id: 7, name: "Bike", nameFA: "بایک" },
  { id: 8, name: "Yellow2", nameFA: "زرد ۲" },
] as const;

export const CITIES = {
  1: { name: "Tehran", nameFA: "تهران", center: [51.389, 35.689] as [number, number], zoom: 11 },
  2: { name: "Karaj", nameFA: "کرج", center: [50.991, 35.84] as [number, number], zoom: 11 },
  3: { name: "Isfahan", nameFA: "اصفهان", center: [51.668, 32.655] as [number, number], zoom: 11 },
  4: { name: "Shiraz", nameFA: "شیراز", center: [52.531, 29.592] as [number, number], zoom: 11 },
  5: { name: "Mashhad", nameFA: "مشهد", center: [59.579, 36.261] as [number, number], zoom: 11 },
} as const;

export const DEFAULT_CITY_ID = 1;
export const DEFAULT_SERVICE_TYPE = 1;
export const DEFAULT_HORIZON = 30;
