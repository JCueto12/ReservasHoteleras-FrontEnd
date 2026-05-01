export const localhost: string = 'http://localhost';

export const environment = {
    apiUrl: localhost.concat(':8090/api'),
    authUrl: localhost.concat(':9000/api/login'),
    apiUsuarios: localhost.concat(':9000/admin/usuarios'),
    apiHuespedes: localhost.concat(':8090/api/huespedes'),
    apiHabitaciones: localhost.concat(':8090/api/habitaciones'),
    apiReservas: localhost.concat(':8090/api/reservas')
};