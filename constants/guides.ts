import { BRAND } from '@/constants/brand';

export interface GuideStep {
  title: string;
  body: string;
}

export interface Guide {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: GuideStep[];
  safetyTips?: string[];
}

export const GUIDE_CATEGORIES = ['Emergencias', 'Mantenimiento', 'Ruta'] as const;

export const GUIDES: Guide[] = [
  {
    id: 'cambiar-rueda',
    title: 'Cambiar una rueda',
    category: 'Emergencias',
    summary: 'Pasos para cambiar una rueda de forma segura en la calle.',
    safetyTips: [
      'Estacioná en lugar plano y visible.',
      'Activá balizas y colocá el triángulo.',
      'Nunca te pongas debajo del auto con el gato.',
    ],
    steps: [
      { title: 'Seguridad', body: 'Frená en lugar seguro, punto de mano y balizas.' },
      { title: 'Aflojá tuercas', body: 'Con la rueda en el piso, aflojá las tuercas sin sacarlas.' },
      { title: 'Levantá', body: 'Colocá el gato en el punto indicado en el manual y elevá el auto.' },
      { title: 'Cambiá', body: 'Sacá tuercas, retirá la rueda, poné la de auxilio y apretá en cruz.' },
      { title: 'Bajá y apretá', body: 'Bajá el auto, apretá tuercas en cruz y revisá presión.' },
    ],
  },
  {
    id: 'puente-bateria',
    title: 'Puente de batería',
    category: 'Emergencias',
    summary: 'Cómo arrancar un auto con batería descargada usando cables.',
    safetyTips: [
      'No conectes polos invertidos (+ con -).',
      'Los autos deben estar apagados al conectar.',
    ],
    steps: [
      { title: 'Orden', body: 'Rojo (+) del auto bueno al muerto. Negro (-) del bueno a masa del muerto (chasis).' },
      { title: 'Arrancá', body: 'Arrancá el auto donante, esperá 2 min y probá arrancar el tuyo.' },
      { title: 'Desconectá', body: 'Invertí el orden al desconectar los cables.' },
    ],
  },
  {
    id: 'control-fluidos',
    title: 'Control de fluidos',
    category: 'Mantenimiento',
    summary: 'Qué revisar cada mes sin ser mecánico.',
    steps: [
      { title: 'Aceite', body: 'Con motor frío, varilla entre MIN y MAX.' },
      { title: 'Refrigerante', body: 'Nivel en el depósito entre marcas (motor frío).' },
      { title: 'Líquido de frenos', body: 'Debe estar cerca del MAX; si baja, revisá en taller.' },
      { title: 'Limpia parabrisas', body: 'Completá el depósito con agua o líquido específico.' },
    ],
  },
  {
    id: 'kit-ruta',
    title: 'Qué llevar en ruta',
    category: 'Ruta',
    summary: 'Checklist básico para viajes en Argentina.',
    steps: [
      { title: 'Documentación', body: 'Cédula, seguro, VTV vigente, licencia.' },
      { title: 'Herramientas', body: 'Rueda de auxilio, gato, llave cruz, triángulo, balizas.' },
      { title: 'Emergencia', body: 'Botiquín, linterna, cargador, agua.' },
      { title: 'App', body: `Registrá cargas y services en ${BRAND.name} para no perder comprobantes.` },
    ],
  },
];

export const FEATURED_GUIDE_IDS = ['cambiar-rueda', 'puente-bateria', 'control-fluidos'] as const;

export function getGuideById(id: string): Guide | undefined {
  return GUIDES.find((g) => g.id === id);
}
