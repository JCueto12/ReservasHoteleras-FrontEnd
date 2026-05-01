export interface EstadoReserva {
    codigo: number;
    descripcion: string;
    nombre: string;
}

export const ESTADOS_RESERVA: Record<string, EstadoReserva> = {
    CONFIRMADA: { codigo: 1, descripcion: 'Reserva creada', nombre: 'CONFIRMADA' },
    EN_CURSO: { codigo: 2, descripcion: 'Check-in realizado', nombre: 'EN_CURSO' },
    FINALIZADA: { codigo: 3, descripcion: 'Check-out realizado', nombre: 'FINALIZADA' },
    CANCELADA: { codigo: 4, descripcion: 'Reserva cancelada', nombre: 'CANCELADA' }
};

