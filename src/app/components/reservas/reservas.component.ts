import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReservaRequest, ReservaResponse } from '../../models/Reservas.model';
import { ESTADOS_RESERVA } from '../../models/EstadoReserva.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservasService } from '../../services/reservas.service';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../constants/Roles';
import Swal from 'sweetalert2';
import { FechasValidators } from '../../constants/FechasValidators';

declare var bootstrap: any;

@Component({
  selector: 'app-reservas',
  standalone: false,
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent {

  textoModal: string = 'Registrar Huesped';
  textoModal2: string = 'Editar Estado de la Reservación';
  reservas: ReservaResponse[] = [];
  reservaForm: FormGroup;
  reservaForm2: FormGroup;
  EstadosReserva = Object.values(ESTADOS_RESERVA);
  isEditMode: boolean = false;
  username: string | null = null;
  showMenuAdmin: boolean = false;
  selectedReserva: ReservaResponse | null = null;

  @ViewChild('reservaModalRef')
  reservaModalEl!: ElementRef;
  @ViewChild('estadoModalRef')
  estadoModalEl!: ElementRef;

  private modalInstance!: any;

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private authService: AuthService
  ){
      this.reservaForm = this.fb.group({
        idHuesped: ['', [Validators.required, Validators.min(1)]],
        idHabitación: ['', [Validators.required, Validators.min(1)]],
        fechaEntrada: ['', [Validators.required, FechasValidators.fechaMinimaHoy]],
        fechaSalida: ['', [Validators.required, FechasValidators.fechaMinimaHoy]],
        idEstadoHabitacion: [1],
      },{
        validators: FechasValidators.fechasValidas()
      }),
      this.reservaForm2 = this.fb.group({
        idEstadoReserva: ['', [Validators.required]],
      });
  }

  ngOnInit(): void {
    this.listarHabitaciones();
    this.username = this.authService.getUsername();
        if(this.authService.hasRole(Roles.ADMIN)) {
          this.showMenuAdmin = true;
        }
  }
  logout(): void {
    this.authService.logout();
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(
      this.reservaModalEl.nativeElement,
      { keyboard: false },
    );
    this.reservaModalEl.nativeElement.addEventListener(
      'hidden.bs.modal',
      () => {},
    );
    this.resetForm();
  }

  listarHabitaciones(): void {
    this.reservasService.getReservas().subscribe({
      next: (resp) => {
        this.reservas = resp;
        console.log('Reservas obtenidas: ', resp);
      },
      error: (error) => {
        console.log('Error al listar reservas: ', 'error');
        Swal.fire('Error', 'No se pudieron cargar las reservas', 'error');
      },
    });
  }

  toggleForm(): void {
    this.resetForm();
    this.textoModal = 'Registrar Reservación';
    this.modalInstance.show();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedReserva = null;
    this.reservaForm.reset();
  }

  editarReserva(reserva: ReservaResponse): void {
      this.isEditMode = true;
      this.selectedReserva = reserva;
      this.textoModal = 'Editando Reservación: ' + reserva.id;
      this.reservaForm.patchValue({ ...reserva });
      this.modalInstance.show();
    }

    editarReservaEstado(id: number): void {
      const reserva = this.reservas.find(r => r.id === id);
      this.reservaForm2.reset();
      if (reserva) {
        this.selectedReserva = reserva;
        this.textoModal2 = 'Editando Estado de la Reservación: ' + reserva.id;
        const modal = new bootstrap.Modal(this.estadoModalEl.nativeElement);
        modal.show();
      }
    }

  onSubmit(): void {
    if (this.reservaForm.invalid) return;
    const reservaData: ReservaRequest = this.reservaForm.value;

    if (this.isEditMode && this.selectedReserva) {
      //ACTUALIZANDO RESERVA
      this.reservasService
        .putReserva(reservaData, this.selectedReserva.id)
        .subscribe({
          next: (reservaActualizada) => {
            const index: number = this.reservas.findIndex(
              (reserva) => reserva.id === this.selectedReserva?.id,
            );
            if (index !== -1) this.reservas[index] = reservaActualizada;

            Swal.fire(
              'Actualizado',
              'La reservacion ha sido actualizada exitosamente',
              'success',
            );
            this.modalInstance.hide();
          },
          error: (error) => {
            console.log('Error al actualizar reservacion: ', error);
            Swal.fire('Error', 'No se pudo actualizar la reservacion', 'error');
          },
        });
    } else {
      //CREANDO RESERVA
      this.reservasService.postReserva(reservaData).subscribe({
        next: (nuevaReserva) => {
          this.reservas.push(nuevaReserva);
          Swal.fire(
            'Registrada',
            'La reservacion ha sido registrada exitosamente',
            'success',
          );
          this.modalInstance.hide();
        },
        error: (error) => {
          console.log('Error al registrar reservacion: ', error);
          Swal.fire('Error', 'No se pudo registrar la reservacion', 'error');
        },
      });
    }
  }

  onSubmitEstado(): void {
    if (this.reservaForm2.invalid || !this.selectedReserva) return;
    this.reservasService
        .patchReserva(this.reservaForm2.value.idEstadoReserva, this.selectedReserva.id)
        .subscribe({
          next: (reservaActualizada) => {
            const index: number = this.reservas.findIndex(
              (reserva) => reserva.id === this.selectedReserva?.id,
            );
            if (index !== -1) this.reservas[index] = reservaActualizada;

            Swal.fire(
              'Actualizado',
              'El estado de la reservacion ha sido actualizado exitosamente',
              'success',
            );
            this.modalInstance.hide();
          },
          error: (error) => {
            console.log('Error al actualizar el estado de la reservacion: ', error);
            Swal.fire('Error', 'No se pudo actualizar el estado de la reservacion', 'error');
          },
        });
  }

  deleteReserva(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `La reservacion ${id} será eliminada permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservasService.deleteReserva(id).subscribe({
          next: () => {
            this.reservas = this.reservas.filter(
              (reserva) => reserva.id !== id,
            );
            Swal.fire(
              'Eliminado',
              'La reservacion ha sido eliminada exitosamente',
              'success',
            );
          },
          error: (error) => {
            console.log('Error al eliminar reservacion: ', error);
            Swal.fire('Error', 'No se pudo eliminar la reservacion', 'error');
          },
        });
      }
    });
  }
}
