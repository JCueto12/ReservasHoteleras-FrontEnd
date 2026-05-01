import { Component, ElementRef, ViewChild } from '@angular/core';
import { HabitacionRequest, HabitacionResponse } from '../../models/Habitacion.model';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HabitacionesService } from '../../services/habitaciones.service';
import Swal from 'sweetalert2';
import { Roles } from '../../constants/Roles';
import { EstadosHabitacion } from '../../models/EstadoHabitacion.model';

declare var bootstrap: any;

@Component({
  selector: 'app-habitaciones',
  standalone: false,
  templateUrl: './habitaciones.component.html',
  styleUrl: './habitaciones.component.css'
})

export class HabitacionesComponent {

  textoModal: string = 'Registrar Huesped';
  textoModal2: string = 'Editar Estado de la Habitacion';
  habitacion: HabitacionResponse[] = [];
  habitacionForm: FormGroup;
  habitacionForm2: FormGroup;
  EstadosHabitacion = Object.values(EstadosHabitacion);
  isEditMode: boolean = false;
  username: string | null = null;
  showMenuAdmin: boolean = false;
  selectedHabitacion: HabitacionResponse | null = null;

  @ViewChild('habitacionModalRef')
  habitacionModalEl!: ElementRef;
  @ViewChild('estadoModalRef')
  estadoModalEl!: ElementRef;

  private modalInstance!: any;

  

  constructor(
    private fb: FormBuilder,
    private habitacionesService: HabitacionesService,
    private authService: AuthService
  ){
      this.habitacionForm = this.fb.group({
        numero: ['', [Validators.required, Validators.min(1)]],
        tipo: ['', [Validators.required, Validators.maxLength(50)]],
        precio: ['', [Validators.required, Validators.min(0.1)]],
        capacidad: ['', [Validators.required, Validators.min(1)]],
        idEstadoHabitacion: [1],
      }),
      this.habitacionForm2 = this.fb.group({
        idEstadoHabitacion: ['', [Validators.required]],
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
      this.habitacionModalEl.nativeElement,
      { keyboard: false },
    );
    this.habitacionModalEl.nativeElement.addEventListener(
      'hidden.bs.modal',
      () => {},
    );
    this.resetForm();
  }

  listarHabitaciones(): void {
    this.habitacionesService.getHabitaciones().subscribe({
      next: (resp) => {
        this.habitacion = resp;
        console.log('Habitaciones obtenidas: ', resp);
      },
      error: (error) => {
        console.log('Error al listar habitaciones: ', 'error');
        Swal.fire('Error', 'No se pudieron cargar las habitaciones', 'error');
      },
    });
  }

  toggleForm(): void {
    this.resetForm();
    this.textoModal = 'Registrar Habitacion';
    this.modalInstance.show();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedHabitacion = null;
    this.habitacionForm.reset();
  }

  editarHabitacion(habitacion: HabitacionResponse): void {
      this.isEditMode = true;
      this.selectedHabitacion = habitacion;
      this.textoModal = 'Editando Habitacion: ' + habitacion.numero;
      this.habitacionForm.patchValue({ ...habitacion });
      this.modalInstance.show();
    }

    editarHabitacionEstado(id: number): void {
      const habitacion = this.habitacion.find(h => h.id === id);
      this.habitacionForm2.reset();
      if (habitacion) {
        this.selectedHabitacion = habitacion;
        this.textoModal2 = 'Editando Estado de la Habitacion: ' + habitacion.numero;
        const modal = new bootstrap.Modal(this.estadoModalEl.nativeElement);
        modal.show();
      }
    }

    onSubmit(): void {
      //console.info('Valor de formulario: ', this.habitacionForm.value);
      if (this.habitacionForm.invalid) return;
      const habitacionData: HabitacionRequest = this.habitacionForm.value;
  
      if (this.isEditMode && this.selectedHabitacion) {
        //ACTUALIZANDO HABITACION
        this.habitacionesService
          .putHabitacion(habitacionData, this.selectedHabitacion.id)
          .subscribe({
            next: (habitacionActualizada) => {
              const index: number = this.habitacion.findIndex(
                (habitacion) => habitacion.id === this.selectedHabitacion?.id,
              );
              if (index !== -1) this.habitacion[index] = habitacionActualizada;
  
              Swal.fire(
                'Actualizado',
                'La habitacion ha sido actualizada exitosamente',
                'success',
              );
              this.modalInstance.hide();
            },
            error: (error) => {
              console.log('Error al actualizar habitacion: ', error);
              Swal.fire('Error', 'No se pudo actualizar la habitacion', 'error');
            },
          });
      } else {
        //CREANDO HABITACION
        this.habitacionesService.postHabitacion(habitacionData).subscribe({
          next: (nuevaHabitacion) => {
            this.habitacion.push(nuevaHabitacion);
            Swal.fire(
              'Registrada',
              'La habitacion ha sido registrada exitosamente',
              'success',
            );
            this.modalInstance.hide();
          },
          error: (error) => {
            console.log('Error al registrar habitacion: ', error);
            Swal.fire('Error', 'No se pudo registrar la habitacion', 'error');
          },
        });
      }
    }

    onSubmitEstado(): void {
      if (this.habitacionForm2.invalid || !this.selectedHabitacion) return;
      this.habitacionesService
          .putHabitacionEstado(this.habitacionForm2.value.idEstadoHabitacion, this.selectedHabitacion.id)
          .subscribe({
            next: (habitacionActualizada) => {
              const index: number = this.habitacion.findIndex(
                (habitacion) => habitacion.id === this.selectedHabitacion?.id,
              );
              if (index !== -1) this.habitacion[index] = habitacionActualizada;

              Swal.fire(
                'Actualizado',
                'El estado de la habitacion ha sido actualizado exitosamente',
                'success',
              );
              this.modalInstance.hide();
            },
            error: (error) => {
              console.log('Error al actualizar el estado de la habitacion: ', error);
              Swal.fire('Error', 'No se pudo actualizar el estado de la habitacion', 'error');
            },
          });
    }
  
    deleteHabitacion(id: number): void {
      Swal.fire({
        title: '¿Estás seguro?',
        text: `La habitacion ${id} será eliminada permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.habitacionesService.deleteHabitacion(id).subscribe({
            next: () => {
              this.habitacion = this.habitacion.filter(
                (habitacion) => habitacion.id !== id,
              );
              Swal.fire(
                'Eliminado',
                'La habitacion ha sido eliminada exitosamente',
                'success',
              );
            },
            error: (error) => {
              console.log('Error al eliminar habitacion: ', error);
              Swal.fire('Error', 'No se pudo eliminar la habitacion', 'error');
            },
          });
        }
      });
    }
}
