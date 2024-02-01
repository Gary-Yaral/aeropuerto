import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiSpringService } from 'src/app/services/api-spring.service';
import { Enviroment } from 'src/app/environment/enviroment';
import Swal from 'sweetalert2';

const uri_local = Enviroment.uri_local;
const uri_local_mongo = Enviroment.uri_local_mongo;

@Component({
  selector: 'app-avion',
  templateUrl: './avion.component.html',
  styleUrls: ['./avion.component.scss']
})
export class AvionComponent implements OnInit {
  avionesLista: any = [];
  pilotos: any = [];
  updateActive: boolean = false;
  errorSend: string = "";
  selectedAvion: string = "";
  urlAviones: string = uri_local + "aviones";
  urlVuelos: string = uri_local_mongo + "vuelos";

  constructor(private springService: ApiSpringService) {}

  ngOnInit(): void {
    this.getAviones();
    this.getPilotos();
  }

  airplaneData: FormGroup = new FormGroup({
    nombre_aeronave: new FormControl('', [Validators.required]),
    company: new FormControl('', [Validators.required]),
    capacidad_pasajeros: new FormControl('', [Validators.required]),
    horas_vuelo: new FormControl('', [Validators.required]),
    piloto: new FormControl('', [Validators.required]),
  });

  saveAvion() {
    if (this.airplaneData.valid) {
      const selectedPilotoId = this.airplaneData.value.piloto;
      if (selectedPilotoId !== '') {
        const avionDto = {
          nombre_aeronave: this.airplaneData.value.nombre_aeronave,
          company: this.airplaneData.value.company,
          capacidad_pasajeros: this.airplaneData.value.capacidad_pasajeros,
          horas_vuelo: this.airplaneData.value.horas_vuelo,
          pilotoId: selectedPilotoId,
        };

        this.springService.doPost(this.urlAviones, avionDto).subscribe(
          (response: any) => {
            console.log(response);

            if (response) {
              this.getAviones();
              this.resetForm();
              this.errorSend = "";
              Swal.fire("Ok", response.message, "success");
            } else {
              this.errorSend = response.message;
            }
          },
          (error: any) => {
            console.error("Error al guardar el avión:", error);
            this.errorSend = "Error al comunicarse con el servidor.";
          }
        );
      } else {
        this.errorSend = "Piloto no encontrado. Selecciona un piloto válido.";
      }
    } else {
      this.errorSend = "Asegúrese de completar todos los campos";
    }
  }


  getAviones() {
    this.springService.doGet(this.urlAviones).subscribe((response: any) => {
      this.avionesLista = response;
    });
  }

  getPilotos() {
    this.springService.doGet(uri_local + "pilotos").subscribe((response: any) => {
      this.pilotos = response;
    });
  }

  loadUpdate(avionId: string) {
    // Limpiar los mensajes de error
    this.errorSend  = ''
    const avionFound = this.avionesLista.find((data: any) => data.avion.id === avionId);
    this.updateActive = true;
    this.selectedAvion = avionId;
    this.airplaneData.setValue({
      nombre_aeronave: avionFound.avion.nombre_aeronave,
      company: avionFound.avion.company,
      capacidad_pasajeros: avionFound.avion.capacidad_pasajeros,
      horas_vuelo: avionFound.avion.horas_vuelo,
      piloto: avionFound.piloto.id,
    });
  }

  updateAvion() {
    if (this.airplaneData.valid) {
      const avionDto = { ...this.airplaneData.value, pilotoId: this.airplaneData.value.piloto };

      this.springService
        .doPut(`${this.urlAviones}/${this.selectedAvion}`, avionDto)
        .subscribe((response: any) => {
            if (response) {
              this.getAviones();
              this.resetForm();
              this.updateActive = false;
              this.errorSend = ''
              Swal.fire("Ok", response.message, "success");
            } else {
              this.errorSend = response.message;
            }
        },
        (error: any) => {
          console.error("Error al actualizar el avión:", error);
          this.errorSend = "Error al comunicarse con el servidor.";
        }
        );
    } else {
      this.errorSend = 'Debes completar todos los campos'
    }
  }

  deleteAvion(avionId: string) {
    Swal.fire({
      icon: 'warning',
      title: '¿Deseas eliminar este avión?',
      text: 'Recuerda que solo podrás eliminar el avión si no tiene registros vinculados',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((press) => {
      if (press.isConfirmed) {
        this.springService
          .doDelete(`${this.urlAviones}/${avionId}`, this.airplaneData.value)
          .subscribe(
            (response: any) => {
              if (response) {
                this.resetForm();
                this.updateActive = false;
                this.errorSend = ''
                this.getAviones()
                Swal.fire("Ok", response.message, "success");
                this.deleteVuelosRelacionados(avionId)
              } else {
                Swal.fire(response.message, '', 'error');
              }
            },
            (error: any) => {
              console.error('Error al eliminar el avión:', error);
              this.errorSend = 'Error al comunicarse con el servidor.';
            }
          );
      }
    });
  }

  deleteVuelosRelacionados(avionId: string) {
    this.springService
      .doDelete(`${this.urlVuelos}/todos/${avionId}`, this.airplaneData.value)
      .subscribe((response: any) => {
        if (response) {
          Swal.fire("Ok", 'Vuelos relacionados se han eliminado', "success");
        } else {
          Swal.fire('No se ha podido eliminar los vuelos relacionados', '', 'error');
        }
      }, (error: any) => {
        console.error('Error al eliminar aviones vinculados:', error);
      }
      )
  }

  resetForm() {
    this.updateActive = false;
    const controls = Object.keys(this.airplaneData.controls);
    controls.forEach((key) => {
      const control = this.airplaneData.get(key);
      if (control) {
        control.setValue('');
        control.markAsUntouched();
        control.markAsPristine();
        control.updateValueAndValidity();
      }
    });
  }

  messageError(input: string) {
    const validate = this.airplaneData.get(input);
    const isTouched = validate?.touched;
    const isValid = validate?.valid;
    if (validate?.value === '' && isTouched) return false;
    if (validate?.value === '') return true;
    if (validate?.value !== '' && isValid) return true;
    return false;
  }
}
