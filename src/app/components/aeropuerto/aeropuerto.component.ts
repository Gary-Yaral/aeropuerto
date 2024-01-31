import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiSpringService } from 'src/app/services/api-spring.service';
import { Enviroment } from 'src/app/environment/enviroment';
import Swal from 'sweetalert2';

const uri_local = Enviroment.uri_local;

@Component({
  selector: 'app-aeropuerto',
  templateUrl: './aeropuerto.component.html',
  styleUrls: ['./aeropuerto.component.scss']
})
export class AeropuertoComponent implements OnInit {
  aeropuertos: any = [];
  updateActive: boolean = false;
  errorSend: string = "";
  selectedAeropuerto: string = "";
  urlAeropuertos: string = uri_local + "aeropuertos";

  constructor(private springService: ApiSpringService) {}

  ngOnInit(): void {
    this.getAeropuertos();
  }

  aeropuertoData: FormGroup = new FormGroup({
    nombre_aeropuerto: new FormControl('', [Validators.required]),
    pais: new FormControl('', [Validators.required]),
    ciudad: new FormControl('', [Validators.required]),
    numero_hagares: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)])
  });

  saveAeropuerto() {
    if (this.aeropuertoData.valid) {
      this.springService.doPost(this.urlAeropuertos, this.aeropuertoData.value).subscribe((response: any) => {
        if (response.result) {
          Swal.fire("Ok", response.message, "success");
          this.getAeropuertos();
          this.resetForm();
          this.errorSend = "";
        } else {
          this.errorSend = response.message;
        }
      });
    } else {
      this.errorSend = "Asegúrese de completar todos los campos correctamente.";
    }
  }

  getAeropuertos() {
    this.springService.doGet(this.urlAeropuertos).subscribe((response) => {
      this.aeropuertos = response;
    });
  }

  loadUpdate(aeropuertoId: string) {
    const aeropuertoFound = this.aeropuertos.find((aeropuerto: any) => aeropuerto.id === aeropuertoId);
    this.updateActive = true;
    this.selectedAeropuerto = aeropuertoId;
    this.aeropuertoData.get('nombre_aeropuerto')?.setValue(aeropuertoFound.nombre_aeropuerto);
    this.aeropuertoData.get('pais')?.setValue(aeropuertoFound.pais);
    this.aeropuertoData.get('ciudad')?.setValue(aeropuertoFound.ciudad);
    this.aeropuertoData.get('numero_hagares')?.setValue(aeropuertoFound.numero_hagares);
  }

  updateAeropuerto() {
    if (this.aeropuertoData.valid) {
      Swal.fire({
        icon: 'warning',
        title: '¿Deseas actualizar este aeropuerto?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
      }).then((press) => {
        if (press.isConfirmed) {
          this.springService
            .doPut(`${this.urlAeropuertos}/${this.selectedAeropuerto}`, {
              id: this.selectedAeropuerto,
              ...this.aeropuertoData.value
            })
            .subscribe((response: any) => {
              if (response.result) {
                Swal.fire(response.message, '', 'success');
                this.getAeropuertos();
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

  deleteAeropuerto(aeropuertoId: string) {
    Swal.fire({
      icon: 'warning',
      title: '¿Deseas eliminar este aeropuerto?',
      text: 'Recuerda que solo podrás eliminar el aeropuerto si no tiene registros vinculados',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((press) => {
      if (press.isConfirmed) {
        this.springService
          .doDelete(`${this.urlAeropuertos}/${aeropuertoId}`, this.aeropuertoData.value)
          .subscribe((response: any) => {
            if (response.result) {
              Swal.fire(response.message, '', 'success');
              this.getAeropuertos();
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
    const controls = Object.keys(this.aeropuertoData.controls);
    controls.forEach((key) => {
      const control = this.aeropuertoData.get(key);
      if (control) {
        control.setValue('');
        control.markAsUntouched();
        control.markAsPristine();
        control.updateValueAndValidity();
      }
    });
  }

  messageError(input: string) {
    const validate = this.aeropuertoData.get(input);
    const isTouched = validate?.touched;
    const isValid = validate?.valid;
    if (validate?.value === '' && isTouched) return false;
    if (validate?.value === '') return true;
    if (validate?.value !== '' && isValid) return true;
    return false;
  }
}
