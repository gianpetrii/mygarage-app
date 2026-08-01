/** Valor único o desglose por versión/trim del catálogo. */
export interface VehicleSpecRow {
  label: string;
  /** Igual en todas las versiones listadas en `versions`. */
  value?: string;
  /** Un valor por versión (clave = nombre del trim). */
  byVersion?: Record<string, string>;
}

export interface VehicleSpecSection {
  title: string;
  rows: VehicleSpecRow[];
}

export interface VehicleModelSpecs {
  make: string;
  model: string;
  displayName: string;
  subtitle: string;
  /** Columnas de la tabla comparativa (trims con ficha cargada). */
  versions: string[];
  yearFrom?: number;
  yearTo?: number;
  sections: VehicleSpecSection[];
}

function row(label: string, value: string): VehicleSpecRow {
  return { label, value };
}

function byVer(label: string, values: Record<string, string>): VehicleSpecRow {
  return { label, byVersion: values };
}

export const VEHICLE_SPECS_CATALOG: VehicleModelSpecs[] = [
  {
    make: 'Volkswagen',
    model: 'Gol',
    displayName: 'Volkswagen Gol',
    subtitle: 'Hatchback 5 puertas · Generación nacional 2013–2023',
    versions: ['Trend', 'Comfortline', 'Highline'],
    yearFrom: 2013,
    yearTo: 2023,
    sections: [
      {
        title: 'Motor',
        rows: [
          row('Motor', 'Nafta'),
          byVer('Potencia máxima', { Trend: '101 CV', Comfortline: '101 CV', Highline: '101 CV' }),
          byVer('Torque máximo', { Trend: '155 Nm', Comfortline: '155 Nm', Highline: '155 Nm' }),
          row('Revoluciones potencia máx.', '5.750 rpm'),
          row('Revoluciones torque máx.', '3.800 rpm'),
          row('Ubicación', 'Delantero transversal'),
          row('Número de cilindros', '4'),
          row('Disposición', 'En línea'),
          row('Número de válvulas', '16'),
          row('Alimentación', 'Inyección electrónica multipunto'),
          row('Cilindrada', '1.598 c.c.'),
        ],
      },
      {
        title: 'Transmisión',
        rows: [
          row('Tracción', 'Delantera'),
          byVer('Caja de cambios', {
            Trend: 'Manual',
            Comfortline: 'Manual / Automática',
            Highline: 'Automática',
          }),
          byVer('Número de velocidades', {
            Trend: '5',
            Comfortline: '5 / 6',
            Highline: '6',
          }),
        ],
      },
      {
        title: 'Consumo',
        rows: [
          byVer('Urbano', { Trend: '12,4 km/l', Comfortline: '12,2 km/l', Highline: '11,8 km/l' }),
          byVer('Ruta / autopista', { Trend: '15,6 km/l', Comfortline: '15,4 km/l', Highline: '14,9 km/l' }),
          byVer('Autonomía estimada', { Trend: '680 km', Comfortline: '670 km', Highline: '650 km' }),
        ],
      },
      {
        title: 'Chasis',
        rows: [
          row('Suspensión delantera', 'Independiente McPherson'),
          row('Suspensión trasera', 'Eje de torsión'),
          row('Frenos delanteros', 'Discos ventilados'),
          byVer('Frenos traseros', {
            Trend: 'Tambor',
            Comfortline: 'Tambor',
            Highline: 'Discos sólidos',
          }),
          row('Dirección', 'Eléctrica asistida'),
          byVer('Neumáticos', {
            Trend: '185/60 R15',
            Comfortline: '195/55 R15',
            Highline: '195/55 R16',
          }),
        ],
      },
      {
        title: 'Dimensiones, peso y capacidades',
        rows: [
          row('Tipo de carrocería', 'Hatchback'),
          row('Número de puertas', '5'),
          row('Largo / ancho / alto (mm)', '3.903 / 1.664 / 1.471'),
          row('Batalla (mm)', '2.470'),
          row('Tanque de combustible', '55 litros'),
          byVer('Capacidad del baúl', {
            Trend: '285 litros',
            Comfortline: '285 litros',
            Highline: '285 litros',
          }),
          byVer('Peso en orden de marcha', {
            Trend: '1.010 kg',
            Comfortline: '1.035 kg',
            Highline: '1.065 kg',
          }),
        ],
      },
    ],
  },
  {
    make: 'Toyota',
    model: 'Corolla',
    displayName: 'Toyota Corolla',
    subtitle: 'Sedán 4 puertas · Generación XII (2014–2024)',
    versions: ['XEI', 'SEG', 'SE-G'],
    yearFrom: 2014,
    yearTo: 2024,
    sections: [
      {
        title: 'Motor',
        rows: [
          row('Motor', 'Nafta'),
          byVer('Potencia máxima', { XEI: '140 CV', SEG: '168 CV', 'SE-G': '168 CV' }),
          byVer('Torque máximo', { XEI: '173 Nm', SEG: '200 Nm', 'SE-G': '200 Nm' }),
          byVer('Revoluciones potencia máx.', { XEI: '6.400 rpm', SEG: '6.600 rpm', 'SE-G': '6.600 rpm' }),
          row('Ubicación', 'Delantero transversal'),
          row('Número de cilindros', '4'),
          row('Disposición', 'En línea'),
          row('Número de válvulas', '16'),
          byVer('Alimentación', {
            XEI: 'Inyección multipunto',
            SEG: 'Inyección directa',
            'SE-G': 'Inyección directa',
          }),
          byVer('Cilindrada', { XEI: '1.798 c.c.', SEG: '2.000 c.c.', 'SE-G': '2.000 c.c.' }),
        ],
      },
      {
        title: 'Transmisión',
        rows: [
          row('Tracción', 'Delantera'),
          byVer('Caja de cambios', { XEI: 'Manual / CVT', SEG: 'CVT', 'SE-G': 'CVT' }),
          byVer('Número de velocidades', { XEI: '6 / CVT', SEG: 'CVT', 'SE-G': 'CVT' }),
        ],
      },
      {
        title: 'Consumo',
        rows: [
          byVer('Urbano', { XEI: '13,2 km/l', SEG: '12,8 km/l', 'SE-G': '12,6 km/l' }),
          byVer('Ruta / autopista', { XEI: '16,8 km/l', SEG: '16,2 km/l', 'SE-G': '16,0 km/l' }),
          byVer('Autonomía estimada', { XEI: '750 km', SEG: '720 km', 'SE-G': '710 km' }),
        ],
      },
      {
        title: 'Chasis',
        rows: [
          row('Suspensión delantera', 'McPherson'),
          row('Suspensión trasera', 'Eje de torsión'),
          row('Frenos delanteros', 'Discos ventilados'),
          row('Frenos traseros', 'Discos sólidos'),
          row('Dirección', 'Eléctrica asistida'),
          byVer('Neumáticos', { XEI: '195/65 R15', SEG: '205/55 R16', 'SE-G': '225/45 R17' }),
        ],
      },
      {
        title: 'Dimensiones, peso y capacidades',
        rows: [
          row('Tipo de carrocería', 'Sedán'),
          row('Número de puertas', '4'),
          row('Largo / ancho / alto (mm)', '4.620 / 1.775 / 1.435'),
          row('Batalla (mm)', '2.700'),
          row('Tanque de combustible', '50 litros'),
          row('Capacidad del baúl', '470 litros'),
          byVer('Peso en orden de marcha', { XEI: '1.280 kg', SEG: '1.350 kg', 'SE-G': '1.380 kg' }),
        ],
      },
    ],
  },
  {
    make: 'Chevrolet',
    model: 'Onix',
    displayName: 'Chevrolet Onix',
    subtitle: 'Hatchback 5 puertas · Generación nacional 2016–2024',
    versions: ['LT', 'LTZ', 'Premier'],
    yearFrom: 2016,
    yearTo: 2024,
    sections: [
      {
        title: 'Motor',
        rows: [
          row('Motor', 'Nafta'),
          byVer('Potencia máxima', { LT: '116 CV', LTZ: '153 CV', Premier: '153 CV' }),
          byVer('Torque máximo', { LT: '160 Nm', LTZ: '235 Nm', Premier: '235 Nm' }),
          byVer('Revoluciones potencia máx.', { LT: '6.000 rpm', LTZ: '5.500 rpm', Premier: '5.500 rpm' }),
          row('Ubicación', 'Delantero transversal'),
          byVer('Número de cilindros', { LT: '4', LTZ: '3', Premier: '3' }),
          row('Disposición', 'En línea'),
          byVer('Número de válvulas', { LT: '16', LTZ: '12', Premier: '12' }),
          byVer('Alimentación', {
            LT: 'Inyección multipunto',
            LTZ: 'Inyección turbo',
            Premier: 'Inyección turbo',
          }),
          byVer('Cilindrada', { LT: '1.399 c.c.', LTZ: '999 c.c.', Premier: '999 c.c.' }),
        ],
      },
      {
        title: 'Transmisión',
        rows: [
          row('Tracción', 'Delantera'),
          byVer('Caja de cambios', { LT: 'Manual', LTZ: 'Automática', Premier: 'Automática' }),
          byVer('Número de velocidades', { LT: '5', LTZ: '6', Premier: '6' }),
        ],
      },
      {
        title: 'Consumo',
        rows: [
          byVer('Urbano', { LT: '13,5 km/l', LTZ: '12,8 km/l', Premier: '12,6 km/l' }),
          byVer('Ruta / autopista', { LT: '16,5 km/l', LTZ: '15,8 km/l', Premier: '15,6 km/l' }),
          byVer('Autonomía estimada', { LT: '620 km', LTZ: '600 km', Premier: '590 km' }),
        ],
      },
      {
        title: 'Chasis',
        rows: [
          row('Suspensión delantera', 'McPherson'),
          row('Suspensión trasera', 'Eje de torsión'),
          row('Frenos delanteros', 'Discos ventilados'),
          byVer('Frenos traseros', { LT: 'Tambor', LTZ: 'Discos sólidos', Premier: 'Discos sólidos' }),
          row('Dirección', 'Eléctrica asistida'),
          byVer('Neumáticos', { LT: '185/65 R15', LTZ: '195/55 R16', Premier: '195/55 R16' }),
        ],
      },
      {
        title: 'Dimensiones, peso y capacidades',
        rows: [
          row('Tipo de carrocería', 'Hatchback'),
          row('Número de puertas', '5'),
          row('Largo / ancho / alto (mm)', '4.160 / 1.730 / 1.480'),
          row('Batalla (mm)', '2.550'),
          row('Tanque de combustible', '44 litros'),
          byVer('Capacidad del baúl', { LT: '275 litros', LTZ: '303 litros', Premier: '303 litros' }),
          byVer('Peso en orden de marcha', { LT: '1.050 kg', LTZ: '1.120 kg', Premier: '1.145 kg' }),
        ],
      },
    ],
  },
];

/** Resuelve el valor a mostrar para una fila y versión. */
export function resolveSpecCell(row: VehicleSpecRow, version: string): string {
  if (row.value) return row.value;
  if (row.byVersion) {
    return row.byVersion[version] ?? '—';
  }
  return '—';
}

/** ¿La fila tiene el mismo valor en todas las versiones? */
export function isUniformRow(row: VehicleSpecRow, versions: string[]): boolean {
  if (row.value) return true;
  if (!row.byVersion) return true;
  const vals = versions.map((v) => row.byVersion![v]).filter(Boolean);
  if (vals.length === 0) return true;
  return vals.every((val) => val === vals[0]);
}
