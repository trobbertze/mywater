import { Component } from '@angular/core'
import { AngularFire, FirebaseListObservable } from 'angularfire2'
import { NavController, AlertController, LoadingController } from 'ionic-angular'

declare let moment: any

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
  readings: FirebaseListObservable<any>
  auth: any
  authSubscription: any
  filter: any
  constructor(public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private af: AngularFire) {
      this.filter = 'thisMonth'
  }
  ionViewWillEnter () {
    this.authSubscription = this.af.auth.subscribe(auth => {
      this.auth = auth
      if (this.auth && !this.readings) {
        let loader = this.loadingCtrl.create({
          content: 'Fetching meter readings...'
        });
        loader.present()
        this.readings = this.af.database.list('/readings/' + this.auth.uid, {
          query: {
            orderByChild: 'timestamp'
          }
        })
        this.readings.subscribe(
          (readings) => {
            loader.dismiss()
            this.applyFilter(readings, this.filter)
          },
          (err) => console.log(err)
        )
      }
    })
  }
  ionViewDidLeave () {
    this.authSubscription.unsubscribe()
  }
  public lineChartData:Array<any> = [
    {data: [], label: 'Readings'}
  ];
  // public lineChartLabels:Array<any> = [];
  public lineChartOptions:any = {
    animation: false,
    responsive: true,
    scales: {
      xAxes: [{
        type: 'time',
        position: 'bottom'
      }]
    }
  };
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend:boolean = false;
  public lineChartType:string = 'line';
  applyFilter (readings, filter) {
    let data:Array<any> = new Array()
    readings.forEach((reading) => {
      let item = {
        x: reading.timestamp,
        y: reading.value
      }
      if (filter === 'thisMonth' && (moment(reading.timestamp).month() === moment().month())) {
        data.push(item)
      }
      else if (filter === 'lastMonth' && (moment(reading.timestamp).month() === (moment().month() - 1))) {
        data.push(item)
      }
      else if (filter === 'allTime') {
        data.push(item)
      }

    })
    data.sort((a, b) => a - b )
    let _lineChartData:Array<any> = new Array(1);
    _lineChartData[0] = {
      data: data,
      label: 'Readings'
    }
    this.lineChartData = _lineChartData;
  }
  selectedThisMonth () {
    this.readings.forEach((readings) => this.applyFilter(readings, 'thisMonth'))
  }
  selectedLastMonth () {
    this.readings.forEach((readings) => this.applyFilter(readings, 'lastMonth'))
  }
  selectedAllTime () {
    this.readings.forEach((readings) => this.applyFilter(readings, 'allTime'))
  }
}
