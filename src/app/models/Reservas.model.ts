export interface ReservaResponse {
    id: number;
    idHuesped: number;       
    idHabitacion: number;    
    fechaEntrada: Date;     
    fechaSalida: Date;       
    estadoReserva: string; 
}

export interface ReservaRequest {
    idHuesped: number;       
    idHabitacion: number;    
    fechaEntrada: Date;     
    fechaSalida: Date;       
    estadoReserva: string; 
}