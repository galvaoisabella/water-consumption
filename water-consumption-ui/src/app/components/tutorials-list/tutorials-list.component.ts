import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';
import { SensorData } from 'src/app/models/sensorData.model';
import { SensorService } from 'src/app/services/sensor.service';

@Component({
  selector: 'app-tutorials-list',
  templateUrl: './tutorials-list.component.html',
  styleUrls: ['./tutorials-list.component.css']
})
export class TutorialsListComponent implements OnInit {
  sensorData?: SensorData[];
  currentTutorial: SensorData = {};
  currentIndex = -1;
  title = '';

  //Parâmetros gráfico de barras
  // public barChartOptions = {
  //   scaleShowVerticalLines: false,
  //   responsive: true
  // };
  // public barChartLabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  // public barChartType = 'bar';
  // public barChartLegend = true;
  // public barChartData = [
  //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  // ];

  //Parametros grafico de linha
  public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Volume(L)' },
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: ChartOptions = {
    responsive: true,
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'rgba(0,51,102)',
      backgroundColor: 'rgba(51,153,255,0.4)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  constructor(private sensorService: SensorService) { }

  ngOnInit(): void {
    // this.retrieveTutorials();
  }

  retrieveTutorials(): void {
    this.sensorService.getAll()
      .subscribe(
        data => {
          this.sensorData = data;
          console.log(data);
        },
        error => {
          console.log(error);
        });
  }

  refreshList(): void {
    this.retrieveTutorials();
    this.currentTutorial = {};
    this.currentIndex = -1;
  }

  setActiveTutorial(sensor: SensorData, index: number): void {
    this.currentTutorial = sensor;
    this.currentIndex = index;
  }
}
