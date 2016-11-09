import { Component } from '@angular/core'
import { AngularFire, FirebaseListObservable } from 'angularfire2'
import { NavController, AlertController, LoadingController } from 'ionic-angular'

import { RestrictionLevelsService } from '../../providers/restrictionLevel.service';

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
  restrictionNotice: any
  constructor(public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private af: AngularFire,
    private restrictions: RestrictionLevelsService) {
      this.filter = 'thisMonth'
      this.restrictions.getBanner('thisMonth').then((banner) => {
        this.restrictionNotice = banner
      })
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
  ]
  public lineChartOptions:any = {
    animation: {},
    responsive: true,
    scales: {
      xAxes: [{
        type: 'time',
        position: 'bottom'
      }]
    }
  }
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(57,126,245,0.2)',
      borderColor: 'rgba(57,126,245,1)',
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgba(57,126,245,1)',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      borderColor: 'rgb(102, 255, 102)',
      backgroundColor: '#fff'
    },
    {
      borderColor: 'rgb(217, 255, 102)',
      backgroundColor: '#fff'
    },
    {
      borderColor: 'rgb(255, 255, 102)',
      backgroundColor: '#fff'
    },
    {
      borderColor: 'rgb(255, 217, 102)',
      backgroundColor: '#fff'
    },
    {
      borderColor: 'rgb(255, 140, 102)',
      backgroundColor: '#fff'
    },
    {
      borderColor: 'rgb(255, 102, 102)',
      backgroundColor: '#fff'
    }
  ]
  public lineChartLegend:boolean = false;
  public lineChartType:string = 'line';
  applyFilter (readings, filter) {

    this.restrictions.getBanner(filter).then((banner) => {
      this.restrictionNotice = banner
    })

    let data:Array<any> = new Array()
    let step1:Array<any> = new Array()
    let step2:Array<any> = new Array()
    let step3:Array<any> = new Array()
    let step4:Array<any> = new Array()
    let step5:Array<any> = new Array()
    let step6:Array<any> = new Array()
    readings.forEach((reading) => {
      let item = {
        x: reading.timestamp,
        y: reading.value
      }
      let step1Item = {
        x: reading.timestamp,
        y: 3195
      }
      let step2Item = {
        x: reading.timestamp,
        y: 3200
      }
      let step3Item = {
        x: reading.timestamp,
        y: 3205
      }
      let step4Item = {
        x: reading.timestamp,
        y: 3210
      }
      let step5Item = {
        x: reading.timestamp,
        y: 3215
      }
      let step6Item = {
        x: reading.timestamp,
        y: 3220
      }
      if (filter === 'thisMonth' && (moment(reading.timestamp).month() === moment().month())) {
        data.push(item)
        step1.push(step1Item)
        step2.push(step2Item)
        step3.push(step3Item)
        step4.push(step4Item)
        step5.push(step5Item)
        step6.push(step6Item)
      }
      else if (filter === 'lastMonth' && (moment(reading.timestamp).month() === (moment().month() - 1))) {
        data.push(item)
        step1.push(step1Item)
        step2.push(step2Item)
        step3.push(step3Item)
        step4.push(step4Item)
        step5.push(step5Item)
        step6.push(step6Item)
      }
      else if (filter === 'allTime') {
        data.push(item)
        step1.push(step1Item)
        step2.push(step2Item)
        step3.push(step3Item)
        step4.push(step4Item)
        step5.push(step5Item)
        step6.push(step6Item)
      }
    })
    data.sort((a, b) => a - b )
    let _lineChartData:Array<any> = new Array(2);
    _lineChartData[0] = {
      data: data,
      label: 'Readings'
    }
    _lineChartData[1] = {
      data: step1,
      label: 'Step 1'
    }
    _lineChartData[2] = {
      data: step2,
      label: 'Step 2'
    }
    _lineChartData[3] = {
      data: step3,
      label: 'Step 3'
    }
    _lineChartData[4] = {
      data: step4,
      label: 'Step 4'
    }
    _lineChartData[5] = {
      data: step5,
      label: 'Step 5'
    }
    _lineChartData[6] = {
      data: step6,
      label: 'Step 6'
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
