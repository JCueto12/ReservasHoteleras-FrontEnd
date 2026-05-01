import { 
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
 } from '@angular/core';
import { HuespedRequest, HuespedResponse } from '../../models/Huesped.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HuespedesService } from '../../services/huespedes.service';
import Swal from 'sweetalert2';
import { TipoDocumento } from '../../constants/TipoDocumento';
import { Roles } from '../../constants/Roles';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-huespedes',
  standalone: false,
  templateUrl: './huespedes.component.html',
  styleUrl: './huespedes.component.css'
})
export class HuespedesComponent implements OnInit, AfterViewInit {
  textoModal: string = 'Registrar Huesped';
  huesped: HuespedResponse[] = [];
  username: string | null = null;
  showMenuAdmin: boolean = false;
  huespedForm: FormGroup;
  tipoDocumento = Object.values(TipoDocumento);
  isEditMode: boolean = false;
  selectedHuesped: HuespedResponse | null = null;

  @ViewChild('huespedModalRef')
  huespedModalEl!: ElementRef;

  private modalInstance!: any;

  constructor(
    private fb: FormBuilder,
    private huespedesService: HuespedesService,
    private authService: AuthService
  ) {
    this.huespedForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      apellidoPaterno: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      apellidoMaterno: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      email: ['', [Validators.required, Validators.minLength(8), Validators.email]],
      telefono: ['',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern('^[0-9]+$')
        ]
      ],
      documento: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      tipoDocumento : ['', [Validators.required]],
      nacionalidad: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.listarHuespedes();
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
      this.huespedModalEl.nativeElement,
      { keyboard: false },
    );
    this.huespedModalEl.nativeElement.addEventListener(
      'hidden.bs.modal',
      () => {},
    );
    this.resetForm();
  }

  listarHuespedes(): void {
      this.huespedesService.getHuespedes().subscribe({
        next: (resp) => {
          this.huesped = resp;
          console.log('Huespedes obtenidos: ', resp);
        },
        error: (error) => {
          console.log('Error al listar usuarios: ', 'error');
          Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        },
      });
    }

    toggleForm(): void {
    this.resetForm();
    this.textoModal = 'Registrar Huesped';
    this.modalInstance.show();
  }

    resetForm(): void {
    this.isEditMode = false;
    this.selectedHuesped = null;
    this.huespedForm.reset();
  }

  editarHuesped(huesped: HuespedResponse): void {
    this.isEditMode = true;
    this.selectedHuesped = huesped;
    this.textoModal = 'Editando Huesped: ' + huesped.nombre;
    this.huespedForm.patchValue({ ...huesped });
    this.modalInstance.show();
  }

  onSubmit(): void {
    //console.info('Valor de formulario: ', this.huespedForm.value);
    if (this.huespedForm.invalid) return;
    const huespedData: HuespedRequest = this.huespedForm.value;

    if (this.isEditMode && this.selectedHuesped) {
      //ACTUALIZANDO HUESPED
      this.huespedesService
        .putHuesped(huespedData, this.selectedHuesped.id)
        .subscribe({
          next: (huespedActualizado) => {
            const index: number = this.huesped.findIndex(
              (huesped) => huesped.id === this.selectedHuesped?.id,
            );
            if (index !== -1) this.huesped[index] = huespedActualizado;

            Swal.fire(
              'Actualizado',
              'El huesped ha sido actualizado exitosamente',
              'success',
            );
            this.modalInstance.hide();
          },
          error: (error) => {
            console.log('Error al actualizar huesped: ', error);
            Swal.fire('Error', 'No se pudo actualizar el huesped', 'error');
          },
        });
    } else {
      //CREANDO HUESPED
      this.huespedesService.postHuesped(huespedData).subscribe({
        next: (nuevoHuesped) => {
          this.huesped.push(nuevoHuesped);
          Swal.fire(
            'Registrado',
            'El huesped ha sido registrado exitosamente',
            'success',
          );
          this.modalInstance.hide();
        },
        error: (error) => {
          console.log('Error al registrar huesped: ', error);
          Swal.fire('Error', 'No se pudo registrar el huesped', 'error');
        },
      });
    }
  }

  deleteHuesped(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `El huesped ${id} será eliminado permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.huespedesService.deleteHuesped(id).subscribe({
          next: () => {
            this.huesped = this.huesped.filter(
              (huesped) => huesped.id !== id,
            );
            Swal.fire(
              'Eliminado',
              'El huesped ha sido eliminado exitosamente',
              'success',
            );
          },
          error: (error) => {
            console.log('Error al eliminar huesped: ', error);
            Swal.fire('Error', 'No se pudo eliminar el huesped', 'error');
          },
        });
      }
    });
  }

}
