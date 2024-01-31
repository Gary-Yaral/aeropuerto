import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AvionComponent } from './components/avion/avion.component';
import { HttpClientModule } from '@angular/common/http';
import { PilotoComponent } from './components/piloto/piloto.component';
import { VueloComponent } from './components/vuelo/vuelo.component';
import { PresentacionComponent } from './components/presentacion/presentacion.component';
import { AeropuertoComponent } from './components/aeropuerto/aeropuerto.component';

@NgModule({
  declarations: [
    AppComponent,
    AvionComponent,
    PilotoComponent,
    VueloComponent,
    PresentacionComponent,
    AeropuertoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
