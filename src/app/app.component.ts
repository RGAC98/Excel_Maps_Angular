import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';

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
  mapa: boolean = false;

  cp_lat = 0.34101763889455033;
  cp_lng = -78.12070270845703;
  
  constructor()
  {}
  
  ngOnInit(): void 
  {}

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
      console.log(this.excelData);
      this.extraerCoordenadas();
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
    }
    console.log(this.coords);
  }

  generarMapa()
  {
    this.mapa = true;
  }
}