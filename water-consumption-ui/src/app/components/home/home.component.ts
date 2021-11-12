import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartPoint } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { TaxValue } from 'src/app/enums/tax-value.enum';
import { VolumeRange } from 'src/app/enums/volume-range.enum';
import { SensorData } from 'src/app/models/sensorData.model';
import { SensorService } from 'src/app/services/sensor.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public date = new Date();
  public actualDate = this.date.getMonth() + '/' + this.date.getUTCFullYear();
  public actualVolume: number = 0;
  //Parâmetros gráficos de barras
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    backgroundColor: 'rgba(68,142,355,0.4)',
  };
  public barChartColors: Color[] = [
    {
      borderColor: 'rgba(0,51,102)',
      backgroundColor: 'rgba(68,142,355,0.4)',
    },
  ];
  public barChartLabels = [];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [{ data: [], label: 'Volume(L)' }]

  // Parâmetros de grafico barra de estimativa
  public barChartDataEstimated = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Reais(R$)' },
    // { data: [70, 50, 35, 100, 56, 40, 55], label: 'Volume(L) estimado' },
  ];

  //Parametros grafico de linha
  public lineChartData: ChartDataSets[] = [
    { data: [], label: 'Volume(L) real' },
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true,
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'rgba(0,51,102)',
      backgroundColor: 'rgba(68,142,355,0.4)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  constructor(private sensorService: SensorService) { }

  ngOnInit(): void {
    this.retrieveTutorials();
  }

  retrieveTutorials(): void {
    this.sensorService.getAll()
      .subscribe(
        data => {
          this.buildBarChart(data);
          this.buildLineChart(data);
        },
        error => {
          console.log(error);
        });
  }

  public buildBarChart(sensorData: SensorData[]): void {
    let arrayDate: any = [];
    let arrayVolumeByMonth: any = [];
    let previousDate: any = '';
    let volumeByMonth: any = 0;
    let i = 0;
    sensorData.forEach((data) => {

      if (data.date === previousDate) {
        volumeByMonth += +data.volume;

        arrayVolumeByMonth[arrayDate.indexOf(data.date)] = volumeByMonth;
        console.log('repetição', volumeByMonth  , data.volume, arrayVolumeByMonth)
        
      } else {
        volumeByMonth = +data.volume;
        arrayDate.push(data.date);
        arrayVolumeByMonth.push(volumeByMonth);
      }

     // arrayVolumeByMonth.push(volumeByMonth);
      previousDate = data.date;
      i++;
    }); 

    //arrayVolumeByMonth.slice(1, arrayVolumeByMonth.length-1);
    
    this.barChartData[0].data = arrayVolumeByMonth;
    this.barChartLabels = arrayDate;

    this.actualVolume = arrayVolumeByMonth[arrayDate.indexOf(this.actualDate)];



    this.barChartDataEstimated[0].data = this.taxCalc(arrayVolumeByMonth);

    console.log('array volume', arrayVolumeByMonth, 'array taxa', this.taxCalc(arrayVolumeByMonth));
  }

  public buildLineChart(sensorData: SensorData[]): void {
    let arrayVolume: any = [];
    let arrayHour: any = [];

    sensorData.forEach((data) => {
      arrayVolume.push(data.volume);
      arrayHour.push(data.hour);
    })

    this.lineChartData[0].data = arrayVolume;
    this.lineChartLabels = arrayHour;
  }

  public taxCalc(volumeData: number[]): Array<number> {
    let taxValue = 0;
    let taxByMonth: number[] = [];

    volumeData.forEach((volume) => {
      if (volume <= VolumeRange.UNTIL_10_COMUM) {
        taxValue = TaxValue.UNTIL_10_COMUM;
      } else if ((volume > VolumeRange.UNTIL_10_COMUM) && (volume <= VolumeRange.UNTIL_20_COMUM)) {
        taxValue = TaxValue.UNTIL_10_COMUM + TaxValue.UNTIL_20_COMUM;
      } else if ((volume > VolumeRange.UNTIL_20_COMUM) && (volume <= VolumeRange.UNTIL_30_COMUM)) {
        taxValue = TaxValue.UNTIL_10_COMUM + TaxValue.UNTIL_20_COMUM + TaxValue.UNTIL_30_COMUM;
      } else if ((volume > VolumeRange.UNTIL_30_COMUM) && (volume <= VolumeRange.UNTIL_50_COMUM)) {
        taxValue = TaxValue.UNTIL_10_COMUM + TaxValue.UNTIL_20_COMUM + TaxValue.UNTIL_30_COMUM + TaxValue.UNTIL_50_COMUM;
      } else if ((volume > VolumeRange.UNTIL_50_COMUM) && (volume <= VolumeRange.UNTIL_90_COMUM)) {
        taxValue = TaxValue.UNTIL_10_COMUM + TaxValue.UNTIL_20_COMUM + TaxValue.UNTIL_30_COMUM + TaxValue.UNTIL_50_COMUM + TaxValue.UNTIL_90_COMUM
      } else if (volume > VolumeRange.UNTIL_90_COMUM) {
        taxValue = TaxValue.UNTIL_10_COMUM + TaxValue.MORE;
      }
      taxByMonth.push(taxValue);
    })
    return taxByMonth;
  }
}
