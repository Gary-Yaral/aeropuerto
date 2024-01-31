import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiSpringService } from 'src/app/services/api-spring.service';
import { REGEX_FORM } from 'src/app/utils/validators';
import Swal from 'sweetalert2';
import { Enviroment } from 'src/app/environment/enviroment';

const uri_local = Enviroment.uri_local;

@Component({
  selector: 'app-piloto',
  templateUrl: './piloto.component.html',
  styleUrls: ['./piloto.component.scss']
})
export class PilotoComponent implements OnInit {
  pilotos: any = [];
  updateActive: boolean = false;
  errorSend: string = "";
  selectedPilotos: string = "";
  urlPilotos: string = uri_local + "pilotos";

  constructor(private springService: ApiSpringService) {}

  ngOnInit(): void {
    this.getPilotos();
  }

  employeeData: FormGroup = new FormGroup({
    dni: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidDNI)
    ]),
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidNAME)
    ]),
    lastname: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidLASTNAME)
    ]),
    address: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidLASTNAME)
    ]),
    birthday: new FormControl('', [
      Validators.required
    ]),
    fecha_emis_licencia: new FormControl('', [
      Validators.required
    ]),
  });

  savePiloto() {
    if (this.employeeData.valid) {
      this.springService.doPost(this.urlPilotos, this.employeeData.value).subscribe((response: any) => {
        if (response.result) {
          Swal.fire("Ok", response.message, "success");
          this.getPilotos();
          this.resetForm();
          this.errorSend = "";
        } else {
          this.errorSend = response.message;
        }
      });
    } else {
      this.errorSend = "Asegúrese de completar todos los campos";
    }
  }

  getPilotos() {
    this.springService.doGet(this.urlPilotos).subscribe((response) => {
      this.pilotos = response;
    });
  }

  loadUpdate(employeeId: string) {
    const pilotoFound = this.pilotos.find((employee: any) => employee.id === employeeId);
    this.updateActive = true;
    this.selectedPilotos = employeeId;
    this.employeeData.get('dni')?.setValue(pilotoFound.dni);
    this.employeeData.get('name')?.setValue(pilotoFound.name);
    this.employeeData.get('lastname')?.setValue(pilotoFound.lastname);
    this.employeeData.get('birthday')?.setValue(pilotoFound.birthday);
    this.employeeData.get('address')?.setValue(pilotoFound.address);
    this.employeeData.get('fecha_emis_licencia')?.setValue(pilotoFound.fecha_emis_licencia);
  }

  updatePiloto() {
    if (this.employeeData.valid) {
      Swal.fire({
        icon: 'warning',
        title: '¿Deseas actualizar este piloto?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
      }).then((press) => {
        if (press.isConfirmed) {
          this.springService
            .doPut(`${this.urlPilotos}/${this.selectedPilotos}`, {
              id: this.selectedPilotos,
              ...this.employeeData.value
            })
            .subscribe((response: any) => {
              if (response.result) {
                Swal.fire(response.message, '', 'success');
                this.getPilotos();
                this.resetForm();
                this.updateActive = false;
                this.errorSend = "";
              } else {
                this.errorSend = response.message;
              }
            });
        }
      });
    }
  }

  deleteCard(employeeId: string) {
    Swal.fire({
      icon: 'warning',
      title: '¿Deseas eliminar este piloto?',
      text: 'Recuerda que solo podrás eliminar el piloto si no tiene registros vinculados',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((press) => {
      if (press.isConfirmed) {
        this.springService
          .doDelete(`${this.urlPilotos}/${employeeId}`, this.employeeData.value)
          .subscribe((response: any) => {
            if (response.result) {
              Swal.fire(response.message, '', 'success');
              this.getPilotos();
              this.resetForm();
              this.updateActive = false;
            } else {
              Swal.fire(response.message, '', 'error');
            }
          });
      }
    });
  }

  resetForm() {
    this.updateActive = false;
    const controls = Object.keys(this.employeeData.controls);
    controls.forEach((key) => {
      const control = this.employeeData.get(key);
      if (control) {
        control.setValue('');
        control.markAsUntouched();
        control.markAsPristine();
        control.updateValueAndValidity();
      }
    });
  }

  messageError(input: string) {
    const validate = this.employeeData.get(input);
    const isTouched = validate?.touched;
    const isValid = validate?.valid;
    if (validate?.value === '' && isTouched) return false;
    if (validate?.value === '') return true;
    if (validate?.value !== '' && isValid) return true;
    return false;
  }
}
