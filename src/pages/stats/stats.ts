import { Component } from '@angular/core'
import { AngularFire, FirebaseListObservable } from 'angularfire2'
import { NavController, AlertController, LoadingController } from 'ionic-angular'

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
  readings: FirebaseListObservable<any>
  auth: any
  authSubscription: any
  constructor(public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private af: AngularFire) {

  }
  ionViewWillEnter () {
    this.authSubscription = this.af.auth.subscribe(auth => {
      this.auth = auth
      if (this.auth) {
        let loader = this.loadingCtrl.create({
          content: 'Fetching meter readings...'
        });
        loader.present()
        this.readings = this.af.database.list('/readings/' + this.auth.uid)
        this.readings.subscribe(
          (readings) => {
            loader.dismiss()
            let data:Array<any> = new Array()
            let labels:Array<any> = new Array()
            let x = 0;
            readings.forEach((reading) => {
              data.push({
                x: reading.timestamp,
                y: reading.value
              })
            })
            let _lineChartData:Array<any> = new Array(1);
            _lineChartData[0] = {
              data: data,
              label: 'Readings'
            }
            this.lineChartData = _lineChartData;
            // this.lineChartLabels = labels
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
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';

}
