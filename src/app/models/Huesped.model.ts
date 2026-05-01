import { TipoDocumento } from "../constants/TipoDocumento";

export interface HuespedResponse {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    telefono: string;
    documento: string;
    tipoDocumento: TipoDocumento
    nacionalidad: string
}

export interface HuespedRequest {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    telefono: string;
    documento: string;
    tipoDocumento: TipoDocumento;
    nacionalidad: string
}