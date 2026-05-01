export interface HabitacionResponse {
    id: number;
    numero: number;
    tipo: string;
    precio: string;
    capacidad: number;
    estadoHabitacion: string;
    estadoRegistro: string;
}

export interface HabitacionRequest {
    numero: number;
    tipo: string;
    precio: string;
    capacidad: number;
    idEstadoHabitacion: number;
}