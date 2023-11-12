import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';

//open Street Map imports
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { icon, Marker } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit 
{
  datos = 0;
  excelData : any;
  coords: Array<any> = [];

  mapa:boolean = false;
  map:any;

  distancia:number = 0;
  tiempo:number = 0;
  ruta:any;

  cp_lat = 0.34101763889455033;
  cp_lng = -78.12070270845703;
  
  constructor()
  {}
  
  ngOnInit(): void 
  {
    this.initMap();
  }

  private initMap(): void 
  {
    //configuración del mapa
    this.map = L.map('map', {
      center: [this.cp_lat, this.cp_lng],
      attributionControl: false,
      zoom: 14
    });

    //iconos personalizados
    var iconDefault = L.icon({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    //titulo
    let tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    });

    tiles.addTo(this.map);

    L.marker([this.cp_lat, this.cp_lng]).bindPopup('Casa plus').addTo(this.map).openPopup();
  }

  ReadExcel(event:any)
  {
    let file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = (e) => {
      let workBook = XLSX.read(fileReader.result, {type: 'binary'});
      let sheetNames = workBook.SheetNames;
      this.excelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]]);
      this.datos = this.excelData.length;
    }
  }

  extraerCoordenadas()
  {
    for (let i = 0; i < this.excelData.length; i++) 
    {
      let coord = {
        id: this.excelData[i].Nro.toString(),
        ticket: this.excelData[i].Id,
        cli: this.excelData[i].Cliente,
        lat: parseFloat(this.excelData[i].Latitud),
        lng: parseFloat(this.excelData[i].Longitud)
      }

      this.coords.push(coord);
      
      L.marker([coord.lat, coord.lng]).bindPopup(`${coord.ticket} - ${coord.cli}`).addTo(this.map).addEventListener('click', () => {
        this.dibujarRutas(coord.lat, coord.lng);
      });
    }
  }

  generarMapa()
  {
    this.extraerCoordenadas();
  }

  dibujarRutas(lat:number, lng:number)
  {
    if(this.ruta != undefined)
    {
      this.ruta.remove();
    }

    //ruta
    let ruta:any = L.Routing.control({
      router: L.Routing.osrmv1({
        serviceUrl: `https://router.project-osrm.org/route/v1/`
      }),
      showAlternatives: true, 
      totalDistanceRoundingSensitivity: 1,
      fitSelectedRoutes: false,
      show: false,
      routeWhileDragging: true,
      waypoints: [
        L.latLng(this.cp_lat, this.cp_lng),
        L.latLng(lat, lng),
      ]
    })
    .addTo(this.map);

    ruta.on('routesfound', (e:any) => {
      var routes = e.routes;
      var summary = routes[0].summary;
      this.distancia = summary.totalDistance / 1000; //kilometros
      this.tiempo = Math.round(summary.totalTime % 3600 / 60); //minutos
   });

   this.ruta = ruta;
  }
}