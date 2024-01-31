import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvionComponent } from './components/avion/avion.component';
import { PilotoComponent } from './components/piloto/piloto.component';
import { VueloComponent } from './components/vuelo/vuelo.component';
import { Router, NavigationEnd } from '@angular/router';
import { PresentacionComponent } from './components/presentacion/presentacion.component';
import { AeropuertoComponent } from './components/aeropuerto/aeropuerto.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: "/inicio",
    pathMatch: "full"
  },
  {
    path: 'inicio',
    component: PresentacionComponent
  },
  {
    path: 'aviones',
    component: AvionComponent
  },
  {
    path: 'pilotos',
    component: PilotoComponent
  },
  {
    path: 'aeropuertos',
    component: AeropuertoComponent
  },
  {
    path: 'vuelos',
    component: VueloComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  activeLink: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.url;
      }
    });
  }
 }
