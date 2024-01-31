import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiSpringService } from 'src/app/services/api-spring.service';
import { REGEX_FORM } from 'src/app/utils/validators';
import Swal from 'sweetalert2';
import { Enviroment } from 'src/app/environment/enviroment';

const uri = Enviroment.url;
const uri_local_mongo = Enviroment.uri_local_mongo;
const uri_local = Enviroment.uri_local;

@Component({
  selector: 'app-aviones',
  templateUrl: './vuelo.component.html',
  styleUrls: ['./vuelo.component.scss']
})
export class VueloComponent {
  aviones: any = []
  categories: any = []
  vuelos: any = []
  updateActive: boolean = false;
  selectedAvion: string = "";
  errorSend: string = "";
  urlAvion: string = uri_local + "aviones"
  urlVuelo: string = uri_local_mongo + "vuelos/"
  urlTipos: string = uri_local_mongo + "tipo_vuelos/"
  constructor(private springService: ApiSpringService) { }

  ngOnInit(): void {
    this.getTipos()
    this.getAviones()
    this.getVuelos()
  }

  vueloData: FormGroup = new FormGroup({
    destino: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidText)
    ]),
    precio: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isDecimal)
    ]),
    fecha_salida: new FormControl('', [
      Validators.required
    ]),
    id_avion: new FormControl('', [
      Validators.required
    ]),
    tipo_vuelo: new FormControl('', [
      Validators.required
    ]),
  })

  saveVuelo() {
    if (this.vueloData.valid) {
      this.springService.doPost(this.urlVuelo, this.vueloData.value).subscribe((response: any) => {
        if (response.id) {
          Swal.fire(response.message, "", "success")
          this.getVuelos()
          this.resetForm()
          this.errorSend = ""
        } else {
          this.errorSend = "Error al guardar vuelo"
        }
      })
    } else {
      this.errorSend = "Debes completar todos los campos"
    }
  }

  getAviones() {
    this.springService.doGet(this.urlAvion).subscribe((response) => {
      this.aviones = response
    })
  }

  getTipos() {
    this.springService.doGet(this.urlTipos).subscribe((response) => {
      this.categories = response
    })
  }

  getVuelos() {
    this.springService.doGet(this.urlVuelo).subscribe((response) => {
      this.vuelos = response
    })
  }

  loadUpdate(vueloId: string) {
    const productFound = this.vuelos.find((vuelo: any) => vuelo.id === vueloId)
    this.updateActive = true;
    this.selectedAvion = vueloId;
    this.vueloData.get('id_avion')?.setValue(productFound.id_avion);
    this.vueloData.get('tipo_vuelo')?.setValue(productFound.tipo_vuelo);
    this.vueloData.get('precio')?.setValue(productFound.precio);
    this.vueloData.get('fecha_salida')?.setValue(this.getFecha(productFound.fecha_salida));
    this.vueloData.get('destino')?.setValue(productFound.destino);
  }

  updateAvion() {
    if (this.vueloData.valid) {
      Swal.fire({
        icon: 'warning',
        title: '¿Deseas actualizar este vuelo?',
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
      }).then((press) => {
        if (press.isConfirmed) {
          const urlUpdate = `${this.urlVuelo}${this.selectedAvion}`
          this.springService.doPut(urlUpdate, this.vueloData.value).subscribe((response: any) => {
            if (response.id) {
              Swal.fire(response.message, "", "success")
              this.getVuelos()
              this.resetForm()
              this.updateActive = false;
              this.errorSend = ""
            } else {
              this.errorSend = "Error al actualizar el vuelo"
            }
          })
        }
      })
    } else {
      this.errorSend = "Debes rellenar todos los campos"
    }
  }

  deleteCard(avionId: string) {
    Swal.fire({
      icon: 'warning',
      title: '¿Deseas eliminar este producto?',
      text: 'Recuerda que solo podrás eliminar el vuelo si no tiene registros vinculados',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((press) => {
      if (press.isConfirmed) {
        this.springService.doDelete(`${this.urlVuelo}${avionId}`, this.vueloData.value).subscribe((response: any) => {
          if (response) {
            Swal.fire(response.message, "", "success")
            this.getVuelos()
            this.resetForm()
            this.updateActive = false;
          } else {
            Swal.fire(response.message, "", "error")
          }
        })
      }
    })
  }

  resetForm() {
    this.updateActive = false;
    const controls = Object.keys(this.vueloData.controls);
    controls.forEach(key => {
      const control = this.vueloData.get(key);
      if (control) {
        control.setValue("")
        control.markAsUntouched();
        control.markAsPristine();
        control.updateValueAndValidity();
      }
    });
  }

  searchCategory(categoryId: string) {
    const category = this.categories.find((cat: any) => cat.id === categoryId);
    return category ? category.tipo : '';
  }

  searchVuelo(avionId: string) {
    const vuelo = this.aviones.find((data: any) => data.avion.id === avionId);
    return vuelo ? vuelo.avion.nombre_aeronave : '';
  }

  getFecha(fecha: string) {
    if(fecha.includes('T')){
      return fecha.split('T')[0]
    }

    return fecha
  }

  messageError(input: string) {
    const validate = this.vueloData.get(input);
    const isTouched = validate?.touched;
    const isValid = validate?.valid;
    if (validate?.value === "" && isTouched) return false
    if (validate?.value === "") return true
    if (validate?.value !== "" && isValid) return true
    return false
  }
}
