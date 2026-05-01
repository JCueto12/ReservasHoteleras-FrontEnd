import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { HabitacionRequest, HabitacionResponse } from "../models/Habitacion.model";

@Injectable({
    providedIn: 'root',
})
export class HabitacionesService {
    private apiUrl: string = environment.apiHabitaciones;

    constructor(private http: HttpClient) {}

    getHabitaciones(): Observable<HabitacionResponse[]> {
            return this.http.get<HabitacionResponse[]>(this.apiUrl).pipe(
            map((habitaciones) => habitaciones.sort()),
            catchError((error) => {
                console.error('Error al obtener las habitaciones', error);
                return of([]);
            }),
            );
        }
    
    postHabitacion(habitacion: HabitacionRequest): Observable<HabitacionResponse> {
        return this.http.post<HabitacionResponse>(this.apiUrl, habitacion).pipe(
        catchError((error) => {
            console.error('Error al registrar la habitacion', error);
            return throwError(() => error);
        }),
        );
    }

    putHabitacion(habitacion: HabitacionRequest,huespedId: number,): Observable<HabitacionResponse> {
        return this.http.put<HabitacionResponse>(`${this.apiUrl}/${huespedId}`, habitacion).pipe(
            catchError((error) => {
            console.error('Error al actualizar la habitacion', error);
            return throwError(() => error);
            }),
        );
    }

    putHabitacionEstado(idEstadoHabitacion: number,huespedId: number,): Observable<HabitacionResponse> {
        return this.http.put<HabitacionResponse>(`${this.apiUrl}/${huespedId}/estado/${idEstadoHabitacion}`, {}).pipe(
            catchError((error) => {
                console.error('Error al actualizar el estado de la habitacion', error);
                return throwError(() => error);
            }),
        );
    }

    deleteHabitacion(huespedId: number): Observable<HabitacionResponse> {
        return this.http.delete<HabitacionResponse>(`${this.apiUrl}/${huespedId}`).pipe(
            catchError((error) => {
                console.error('Error al eliminar el huesped', error);
                return throwError(() => error);
            }),
        );
    }
}