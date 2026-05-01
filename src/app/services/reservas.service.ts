import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ReservaRequest, ReservaResponse } from "../models/Reservas.model";

@Injectable({
    providedIn: 'root',
})
export class ReservasService {
    private apiUrl: string = environment.apiReservas;

    constructor(private http: HttpClient) {}

    getReservas(): Observable<ReservaResponse[]> {
        return this.http.get<ReservaResponse[]>(this.apiUrl).pipe(
        map((reservas) => reservas.sort()),
        catchError((error) => {
            console.error('Error al obtener las habitaciones', error);
            return of([]);
        }),
        );
    }
    
    postReserva(reserva: ReservaRequest): Observable<ReservaResponse> {
        return this.http.post<ReservaResponse>(this.apiUrl, reserva).pipe(
        catchError((error) => {
            console.error('Error al registrar la reserva', error);
            return throwError(() => error);
        }),
        );
    }

    putReserva(reserva: ReservaRequest,reservaId: number,): Observable<ReservaResponse> {
        return this.http.put<ReservaResponse>(`${this.apiUrl}/${reservaId}`, reserva).pipe(
            catchError((error) => {
            console.error('Error al actualizar la reserva', error);
            return throwError(() => error);
            }),
        );
    }

    deleteReserva(reservaId: number): Observable<ReservaResponse> {
        return this.http.delete<ReservaResponse>(`${this.apiUrl}/${reservaId}`).pipe(
            catchError((error) => {
                console.error('Error al eliminar la reserva', error);
                return throwError(() => error);
            }),
        );
    }

    patchReserva(idEstadoReserva: number,reservaId: number,){
        return this.http.patch<ReservaResponse>(`${this.apiUrl}/${reservaId}/estado/${idEstadoReserva}`, {}).pipe(
            catchError((error) => {
                console.error('Error al actualizar el estado de la reserva', error);
                return throwError(() => error);
            }),
        );
    }
}