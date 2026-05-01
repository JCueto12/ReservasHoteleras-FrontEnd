import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class FechasValidators {
    static fechasValidas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const entrada = control.get('fechaEntrada')?.value;
        const salida = control.get('fechaSalida')?.value;

        // Si falta alguna fecha, no validamos aún
        if (!entrada || !salida) return null;

        const dateEntrada = new Date(entrada);
        const dateSalida = new Date(salida);

        // Si la salida es menor o igual a la entrada, hay error
        return dateSalida <= dateEntrada ? { fechaInvalida: true } : null;
    };
    }

    // Validador para que la fecha no sea en el pasado
    static fechaMinimaHoy(control: AbstractControl): ValidationErrors | null {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(control.value);

    return fechaSeleccionada < hoy ? { fechaPasada: true } : null;
    }
}
