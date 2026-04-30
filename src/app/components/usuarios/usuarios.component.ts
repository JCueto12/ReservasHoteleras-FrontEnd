import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UsuarioRequest, UsuarioResponse } from '../../models/Usuario.model';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DescripcionRoles, Roles } from '../../constants/Roles';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';

declare var bootstrap: any;

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  textoModal: string = 'Registrar Usuario';
  usuarios: UsuarioResponse[] = [];
  usuarioForm: FormGroup;
  roles: string[] = Object.values(Roles);
  isEditMode: boolean = false;
  selectedUsuario: UsuarioResponse | null = null;

  @ViewChild('usuarioModalRef')
  usuarioModalEl!: ElementRef;

  private modalInstance!: any; /* !: significa que nunca será nulo*/

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
  ) {
    this.usuarioForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roles: [[], [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.listarUsuarios();
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(
      this.usuarioModalEl.nativeElement,
      { keyboard: false },
    );
    this.usuarioModalEl.nativeElement.addEventListener(
      'hidden.bs.modal',
      () => {},
    );
    this.resetForm();
  }

  listarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (resp) => {
        this.usuarios = resp;
      },
      error: (error) => {
        console.log('Error al listar usuarios: ', 'error');
        Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      },
    });
  }

  /* llenarLista(): void {
    this.usuarios = [
      {username: 'admin', roles: ['ROLE_ADMIN']},
      {username: 'usuario', roles: ['ROLE_USER']}
    ];
  } */

  toggleForm(): void {
    this.resetForm();
    this.textoModal = 'Registrar Usuario';
    this.modalInstance.show();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedUsuario = null;
    this.usuarioForm.reset();
  }

  editarUsuario(usuario: UsuarioResponse): void {
    this.isEditMode = true;
    this.selectedUsuario = usuario;
    this.textoModal = 'Editando Usuario: ' + usuario.username;
    this.usuarioForm.patchValue({ ...usuario });
    this.modalInstance.show();
  }

  transformarRol(rol: string): string {
    return DescripcionRoles[rol as Roles] || 'Desconocido';
  }

  onSubmit(): void {
    //console.info('Valor de formulario: ', this.usuarioForm.value);
    if (this.usuarioForm.invalid) return;
    const usuarioData: UsuarioRequest = this.usuarioForm.value;

    if (this.isEditMode && this.selectedUsuario) {
      //ACTUALIZANDO USUARIO
      this.usuariosService
        .putUsuario(usuarioData, usuarioData.username)
        .subscribe({
          next: (usuarioActualizado) => {
            const index: number = this.usuarios.findIndex(
              (usuario) => usuario.username === this.selectedUsuario?.username,
            );
            if (index !== -1) this.usuarios[index] = usuarioActualizado;

            Swal.fire(
              'Actualizado',
              'El usuario ha sido actualizado exitosamente',
              'success',
            );
            this.modalInstance.hide();
          },
          error: (error) => {
            console.log('Error al actualizar usuario: ', error);
            Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
          },
        });
    } else {
      //CREANDO USUARIO
      this.usuariosService.postUsuario(usuarioData).subscribe({
        next: (nuevoUsuario) => {
          this.usuarios.push(nuevoUsuario);
          Swal.fire(
            'Registrado',
            'El usuario ha sido registrado exitosamente',
            'success',
          );
          this.modalInstance.hide();
        },
        error: (error) => {
          console.log('Error al registrar usuario: ', error);
          Swal.fire('Error', 'No se pudo registrar el usuario', 'error');
        },
      });
    }
  }

  deleteUsuario(username: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `El usuario ${username} será eliminado permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.deleteUsuario(username).subscribe({
          next: () => {
            this.usuarios = this.usuarios.filter(
              (usuario) => usuario.username !== username,
            );
            Swal.fire(
              'Eliminado',
              'El usuario ha sido eliminado exitosamente',
              'success',
            );
          },
          error: (error) => {
            console.log('Error al eliminar usuario: ', error);
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          },
        });
      }
    });
  }
}
