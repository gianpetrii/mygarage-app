/** Marcas y modelos frecuentes en Argentina / LATAM. Curado estático, offline. */
export const VEHICLE_CATALOG: Record<string, string[]> = {
  Audi: ['A1', 'A3', 'A4', 'A5', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'],
  BMW: ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6'],
  BYD: ['Dolphin', 'Yuan Plus', 'Song Plus', 'Tang', 'Seal'],
  Chery: ['Tiggo 2', 'Tiggo 3', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5'],
  Chevrolet: [
    'Onix',
    'Onix Plus',
    'Cruze',
    'Tracker',
    'Spin',
    'Montana',
    'S10',
    'Equinox',
    'Captiva',
    'Prisma',
    'Celta',
    'Classic',
  ],
  Citroën: ['C3', 'C3 Aircross', 'C4 Cactus', 'C4 Lounge', 'Berlingo', 'Jumper', 'Jumpy'],
  DS: ['DS3', 'DS4', 'DS7'],
  Fiat: [
    'Argo',
    'Cronos',
    'Mobi',
    'Pulse',
    'Fastback',
    'Toro',
    'Strada',
    'Fiorino',
    'Ducato',
    'Palio',
    'Uno',
    'Siena',
    'Grand Siena',
  ],
  Ford: [
    'Ka',
    'Fiesta',
    'Focus',
    'EcoSport',
    'Kuga',
    'Territory',
    'Ranger',
    'Maverick',
    'F-150',
    'Bronco Sport',
    'Transit',
  ],
  'Great Wall': ['Poer', 'Wingle 5', 'Wingle 7', 'Haval H6'],
  Haval: ['H6', 'Jolion', 'Dargo'],
  Honda: ['Fit', 'City', 'Civic', 'HR-V', 'CR-V', 'WR-V', 'Accord', 'Pilot'],
  Hyundai: ['HB20', 'Creta', 'Tucson', 'Santa Fe', 'i30', 'Accent', 'Elantra', 'Palisade'],
  JAC: ['J2', 'J3', 'J5', 'T40', 'T60', 'E30X'],
  Jeep: ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Gladiator', 'Grand Cherokee'],
  Kia: ['Rio', 'Cerato', 'Sportage', 'Seltos', 'Stonic', 'Carnival', 'Sorento'],
  Lifan: ['X60', 'X70', 'Myway'],
  MG: ['MG3', 'MG5', 'ZS', 'HS', 'RX5'],
  'Mercedes-Benz': ['Clase A', 'Clase B', 'Clase C', 'Clase E', 'GLA', 'GLB', 'GLC', 'GLE', 'Sprinter'],
  Mitsubishi: ['Mirage', 'Lancer', 'ASX', 'Eclipse Cross', 'L200', 'Outlander', 'Montero Sport'],
  Nissan: ['March', 'Versa', 'Kicks', 'Sentra', 'X-Trail', 'Frontier', 'Leaf', 'Pathfinder'],
  Peugeot: ['208', '2008', '308', '408', 'Partner', 'Expert', 'Boxer', '3008', '5008'],
  RAM: ['1500', '2500', 'Rampage', '700'],
  Renault: [
    'Logan',
    'Sandero',
    'Stepway',
    'Kardian',
    'Duster',
    'Oroch',
    'Kangoo',
    'Master',
    'Captur',
    'Fluence',
    'Koleos',
  ],
  Suzuki: ['Swift', 'Vitara', 'Jimny', 'Ertiga', 'S-Cross', 'Grand Vitara'],
  Toyota: [
    'Etios',
    'Yaris',
    'Corolla',
    'Corolla Cross',
    'Hilux',
    'SW4',
    'RAV4',
    'Camry',
    'Prius',
    'Land Cruiser',
    'Hiace',
  ],
  Volkswagen: [
    'Gol',
    'Virtus',
    'Polo',
    'Vento',
    'Taos',
    'Nivus',
    'T-Cross',
    'Amarok',
    'Tiguan',
    'Saveiro',
    'Suran',
    'Bora',
    'Passat',
  ],
  Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'V60'],
};

export const VEHICLE_MAKES = Object.keys(VEHICLE_CATALOG).sort((a, b) =>
  a.localeCompare(b, 'es'),
);

export const OTHER_MAKE_VALUE = '__other_make__';
export const OTHER_MODEL_VALUE = '__other_model__';
export const OTHER_VARIANT_VALUE = '__other_variant__';

/**
 * Versiones / trims frecuentes en Argentina (catálogo parcial, ampliable).
 * Clave: marca → modelo → variantes.
 */
export const VEHICLE_VARIANTS: Record<string, Record<string, string[]>> = {
  Chevrolet: {
    Onix: ['Joy', 'Joy Plus', 'LT', 'LTZ', 'RS', 'Premier'],
    'Onix Plus': ['LT', 'LTZ', 'Premier', 'RS'],
    Tracker: ['LT', 'LTZ', 'Premier', 'RS'],
    Cruze: ['LT', 'LTZ', 'Premier', 'RS'],
    Spin: ['LT', 'LTZ', 'Premier'],
    Montana: ['LT', 'LTZ', 'Premier', 'Z71'],
    S10: ['LS', 'LT', 'LTZ', 'High Country'],
  },
  Fiat: {
    Argo: ['Drive', 'Precision', 'Trekking', 'HGT'],
    Cronos: ['Drive', 'Precision', 'Cronos Plus'],
    Mobi: ['Like', 'Easy', 'Trekking'],
    Pulse: ['Drive', 'Impetus', 'Audace'],
    Fastback: ['Drive', 'Impetus', 'Audace'],
    Toro: ['Freedom', 'Volcano', 'Ranch', 'Ultra'],
    Strada: ['Endurance', 'Freedom', 'Volcano', 'Ranch'],
  },
  Ford: {
    Ka: ['SE', 'SEL', 'Freestyle'],
    Fiesta: ['S', 'SE', 'Titanium'],
    Focus: ['S', 'SE', 'Titanium'],
    EcoSport: ['SE', 'Freestyle', 'Titanium', 'Storm'],
    Kuga: ['S', 'SE', 'Titanium', 'ST-Line'],
    Territory: ['Titanium', 'ST-Line'],
    Ranger: ['XL', 'XLS', 'XLT', 'Limited', 'Black'],
    Maverick: ['XLT', 'Lariat'],
  },
  Volkswagen: {
    Gol: ['Trend', 'Comfortline', 'Highline'],
    Virtus: ['Trendline', 'Comfortline', 'Highline', 'GTS'],
    Polo: ['Trendline', 'Comfortline', 'Highline', 'GTS'],
    Vento: ['Trendline', 'Comfortline', 'Highline', 'GLI'],
    Taos: ['Trendline', 'Comfortline', 'Highline'],
    Nivus: ['Trendline', 'Comfortline', 'Highline', 'GTS'],
    'T-Cross': ['Trendline', 'Comfortline', 'Highline'],
    Amarok: ['Trendline', 'Comfortline', 'Highline', 'V6 Extreme'],
  },
  Toyota: {
    Etios: ['XS', 'XLS', 'XLS Pack', 'Platinum'],
    Yaris: ['XS', 'XLS', 'S', 'XLS Pack'],
    Corolla: ['XEI', 'SEG', 'SE-G', 'GR-S'],
    'Corolla Cross': ['XEI', 'SEG', 'SE-G', 'GR-Sport'],
    Hilux: ['SR', 'SRV', 'SRX', 'S10', 'GR-Sport'],
    SW4: ['SRX', 'SRV', 'Diamond'],
    RAV4: ['XEI', 'SEG', 'Limited'],
  },
  Renault: {
    Logan: ['Life', 'Zen', 'Intens'],
    Sandero: ['Life', 'Zen', 'Intens', 'RS'],
    Stepway: ['Zen', 'Intens', 'Iconic'],
    Kardian: ['Evolution', 'Techno', 'Premier'],
    Duster: ['Zen', 'Intens', 'Iconic'],
    Oroch: ['Zen', 'Intens', 'Outsider'],
  },
  Peugeot: {
    '208': ['Active', 'Allure', 'GT'],
    '2008': ['Active', 'Allure', 'GT'],
    '308': ['Active', 'Allure', 'GT'],
    '3008': ['Active', 'Allure', 'GT'],
  },
  Citroën: {
    C3: ['Live', 'Feel', 'Shine'],
    'C3 Aircross': ['Live', 'Feel', 'Shine'],
    'C4 Cactus': ['Feel', 'Shine'],
  },
  Nissan: {
    March: ['Sense', 'Advance'],
    Versa: ['Sense', 'Advance', 'Exclusive'],
    Kicks: ['Sense', 'Advance', 'Exclusive'],
    Frontier: ['S', 'SE', 'LE', 'PRO-4X'],
  },
  Honda: {
    City: ['LX', 'EX', 'EXL'],
    Civic: ['LX', 'EX', 'EXL', 'Type R'],
    'HR-V': ['LX', 'EX', 'EXL'],
    'CR-V': ['LX', 'EX', 'EXL'],
  },
  Hyundai: {
    HB20: ['Comfort', 'Premium', 'Platinum'],
    Creta: ['Comfort', 'Premium', 'Platinum', 'Limited'],
    Tucson: ['Comfort', 'Premium', 'Limited'],
  },
  Jeep: {
    Renegade: ['Sport', 'Longitude', 'Limited', 'Série S'],
    Compass: ['Sport', 'Longitude', 'Limited', 'Série S'],
    Commander: ['Limited', 'Overland'],
  },
  RAM: {
    '1500': ['Laramie', 'Limited', 'Black Edition'],
    Rampage: ['Rebel', 'Laramie', 'R/T'],
  },
};

export function getVariantsForModel(make: string, model: string): string[] {
  const makeEntry = Object.keys(VEHICLE_VARIANTS).find(
    (m) => m.toLowerCase() === make.trim().toLowerCase(),
  );
  if (!makeEntry) return [];
  const modelEntry = Object.keys(VEHICLE_VARIANTS[makeEntry]).find(
    (m) => m.toLowerCase() === model.trim().toLowerCase(),
  );
  if (!modelEntry) return [];
  return VEHICLE_VARIANTS[makeEntry][modelEntry];
}

export const VEHICLE_YEAR_MIN = 1980;

export function getVehicleYearOptions(): { label: string; value: string }[] {
  const maxYear = new Date().getFullYear() + 1;
  const options: { label: string; value: string }[] = [];
  for (let year = maxYear; year >= VEHICLE_YEAR_MIN; year--) {
    options.push({ label: String(year), value: String(year) });
  }
  return options;
}

export const VEHICLE_YEAR_OPTIONS = getVehicleYearOptions();
