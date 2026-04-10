import { AppState } from "./types";

export const INITIAL_STATE: Omit<AppState, 'children' | 'allowedEmails'> = {
  pin: '1234',
  taskMode: 'single',
  maxDailyPoints: 10,
};

export const PREDEFINED_TASKS = [
  { id: 't1', name: 'Vestirse solo sin protestar', points: 2 },
  { id: 't2', name: 'Ponerse los zapatos', points: 1 },
  { id: 't3', name: 'Salir de casa sin discutir', points: 2 },
  { id: 't4', name: 'Hacer los deberes sin discutir', points: 2 },
  { id: 't5', name: 'Lavarse los dientes', points: 1 },
  { id: 't6', name: 'Recoger los juguetes', points: 2 },
  { id: 't7', name: 'Comer toda la comida', points: 2 },
  { id: 't8', name: 'Ir a la cama a la hora', points: 2 },
  { id: 't9', name: 'Usar palabras amables', points: 1 },
  { id: 't10', name: 'Esperar el turno pacientemente', points: 2 },
  { id: 't11', name: 'Gritar o perder el control', points: -2 },
  { id: 't12', name: 'Insultar o decir palabrotas', points: -3 },
  { id: 't13', name: 'Pegar o empujar', points: -5 },
  { id: 't14', name: 'No recoger cuando se pide', points: -1 },
];

export const PREDEFINED_REWARDS = [
  { id: 'r1', name: 'Ver un episodio de dibujos', cost: 5 },
  { id: 'r2', name: 'Jugar 15 min en la tablet', cost: 10 },
  { id: 'r3', name: 'Elegir la cena', cost: 15 },
  { id: 'r4', name: 'Ir al parque', cost: 10 },
  { id: 'r5', name: 'Un cuento extra antes de dormir', cost: 5 },
  { id: 'r6', name: 'Pegatina especial', cost: 3 },
  { id: 'r7', name: 'Juego de mesa en familia', cost: 15 },
  { id: 'r8', name: 'Helado o postre especial', cost: 20 },
  { id: 'r9', name: 'Construir cabaña en el salón', cost: 25 },
  { id: 'r10', name: 'Excursión el fin de semana', cost: 50 },
];

export const THEMES = [
  { id: 'robots', name: 'Robots (R2-D2)', color: 'bg-blue-500' },
  { id: 'space', name: 'Espacio Exterior', color: 'bg-purple-500' },
  { id: 'dinosaurs', name: 'Dinosaurios', color: 'bg-green-500' },
  { id: 'princesses', name: 'Princesas', color: 'bg-pink-500' },
  { id: 'cars', name: 'Coches de Carreras', color: 'bg-red-500' },
] as const;
