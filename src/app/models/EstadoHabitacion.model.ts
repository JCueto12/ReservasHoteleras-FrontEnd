export interface EstadoHabitacion {
    codigo: number;
    descripcion: string;
    nombre: string;
}

export const EstadosHabitacion = {
    DISPONIBLE: { codigo: 1, descripcion: 'Lista para asignarse', nombre: 'DISPONIBLE' },
    OCUPADA: { codigo: 2, descripcion: 'Asignada a una reserva', nombre: 'OCUPADA' },
    LIMPIEZA: { codigo: 3, descripcion: 'En limpieza', nombre: 'LIMPIEZA' },
    MANTENIMIENTO: { codigo: 4, descripcion: 'En reparación', nombre: 'MANTENIMIENTO' }
} as const;

// Tipo opcional para usarlo en tus interfaces
export type EstadoHabitacionKey = keyof typeof EstadosHabitacion;