import { Component, NgZone } from '@angular/core'
import { AngularFire } from 'angularfire2'
import { NavController, AlertController, ModalController, LoadingController } from 'ionic-angular'

import { RestrictionLevelsService } from '../../providers/restrictionLevel.service';

import { AddInvoiceForm } from '../invoices/add-invoice-form/add-invoice-form'
import { AddReadingForm } from '../readings/add-reading-form/add-reading-form'

declare let firebase: any
declare let moment: any

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
  readings: any
  invoices: any
  auth: any
  authSubscription: any
  filter: any
  restrictionNotice: any
  readingsList: any
  invoiceReadingsList: any
  costEntries: String[]
  showEmptyMessage: boolean
  emptyStatus: any
  emptyMessage: String
  isLoaded: boolean
  constructor(public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private af: AngularFire,
    private restrictions: RestrictionLevelsService,
    private ngZone: NgZone) {
      this.isLoaded = false
      this.showEmptyMessage = false
      this.emptyStatus = {}
      this.readingsList = []
      this.invoiceReadingsList = []
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
          content: 'Fetching data...'
        });
        loader.present()

        if (!this.readings) {
          this.readings = firebase.database().ref('/readings/' + this.auth.uid)
          this.readings.on('value', (readings) => {
            this.updateEmptyStatus('readings', readings.val())
            this.updateReadings(readings.val())
            setTimeout(() => {
              this.ngZone.run(() => {
                loader.dismiss()
                this.isLoaded = true
              })
            }, 100)
          });
        }
        if (!this.invoices) {
          this.invoices = firebase.database().ref('/invoices/' + this.auth.uid)
          this.invoices.on('value', (invoices) => {
            this.updateEmptyStatus('invoices', invoices.val())
            this.updateInvoices(invoices.val())
            setTimeout(() => {
              this.ngZone.run(() => {
                loader.dismiss()
                this.isLoaded = true
              })
            }, 100)
          });
        }
      }
    })
  }
  updateEmptyStatus (item, data) {
    this.emptyStatus[item] = data === null ? false : true

    if (!this.emptyStatus.invoices && !this.emptyStatus.readings) {
      this.emptyMessage =
        `
        Lets get going by loading at least one water invoice and
        recording at least one water meter reading.
        `

      this.showEmptyMessage = true
    }
    else if (!this.emptyStatus.invoices && this.emptyStatus.readings) {
      this.emptyMessage =
      `
      You have recorded some water meter readings.  Please navigate to
      the 'Invoices' section and load at least one invoice.
      `
      this.showEmptyMessage = true
    }
    else if (this.emptyStatus.invoices && !this.emptyStatus.readings) {
      this.emptyMessage =
      `
      You have loaded some water invoices.  Please navigate to the
      'Readings' section and record some water meter readings.
      `
      this.showEmptyMessage = true
    }
    else {
      this.showEmptyMessage = false
    }
  }
  updateInvoices (invoices) {
    this.invoiceReadingsList = [] // this.readingsList.filter((o) => o.isReading)
    for(let key in invoices) {
      this.invoiceReadingsList.push({
        timestamp: invoices[key].periodEndDate,
        value: invoices[key].newReading,
        isReading: false
      })
      this.invoiceReadingsList.push({
        timestamp: invoices[key].periodStartDate,
        value: invoices[key].previousReading,
        isReading: false
      })
    }
    this.applyFilter(this.filter)
  }
  updateReadings (readings) {
    this.readingsList = [] // this.readingsList.filter((o) => !o.isReading)
    for(let key in readings) {
      this.readingsList.push({
        timestamp: readings[key].timestamp,
        value: readings[key].value,
        isReading: true
      })
    }
    this.applyFilter(this.filter)
  }
  ionViewDidLeave () {
    this.authSubscription.unsubscribe()
  }
  public lineChartData:Array<any> = [
    {data: [], label: 'Real usage'}
  ]
  public lineChartOptions:any = {
    animation: {},
    responsive: true,
    legendCallback: function(chart) {
      console.log(chart)
      return '<div>test</div>'
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
            unit: 'week'
        },
        position: 'bottom',
        ticks: {
          callback: function(label, index, labels) {
            return moment(label, 'MMM DD, YYY').format('DD MMM')
          },
          maxRotation: 90,
          minRotation: 90
        }
      }],
      yAxis: [{
        scaleLabel: {
          display: true,
          labelString: 'kl'
        }
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
      pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      lineTension: 0.2
    },
    {
      borderColor: 'rgb(205, 93, 93)',
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    {
      borderColor: 'rgb(102, 255, 102)',
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    {
      borderColor: 'rgb(217, 255, 102)',
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    {
      borderColor: 'rgb(255, 255, 102)',
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    {
      borderColor: 'rgb(255, 217, 102)',
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    {
      borderColor: 'rgb(255, 140, 102)',
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    {
      borderColor: 'rgb(255, 102, 102)',
      backgroundColor: 'rgba(0, 0, 0, 0)'
    }
  ]
  public lineChartLegend:boolean = false;
  public lineChartType:string = 'line';
  buildData (list, filter) {
    let data:Array<any> = new Array()
    list.forEach((reading) => {
        if (filter === 'thisMonth' && (moment(reading.timestamp).month() === moment().month())) {
          data.push({
            x: reading.timestamp,
            y: reading.value
          })
        }
        else if (filter === 'lastMonth' && (moment(reading.timestamp).month() === (moment().month() - 1))) {
          data.push({
            x: reading.timestamp,
            y: reading.value
          })
        }
        else if (filter === 'allTime') {
          data.push({
            x: reading.timestamp,
            y: reading.value
          })
        }
    })

    if (filter === 'lastMonth') {
      let month = this.restrictions.getMonthStartEnd(filter)
      data.push({
        x: month.start,
        y: this.restrictions.getBeginningOfMonthReading(filter, list)
      })
      data.push({
        x: month.end,
        y: this.restrictions.getEndOfMonthReading(filter, list)
      })
    }
    else if (filter === 'thisMonth') {
      let month = this.restrictions.getMonthStartEnd(filter)
      data.push({
        x: month.start,
        y: this.restrictions.getBeginningOfMonthReading(filter, list)
      })
    }

    data = data.sort((a, b) => a.x - b.x )

    return data
  }
  normaliseReadingList () {
    if (this.readingsList.length === 1 &&
    this.invoiceReadingsList.length > 0) {
      let invoiceReading = this.invoiceReadingsList.find((o) => {
        return o.timestamp <  this.readingsList[0].timestamp &&
        parseFloat(o.value) < parseFloat(this.readingsList[0].value)
      })
      let returnArray = [invoiceReading, this.readingsList[0]]
      return returnArray
    }
    return this.readingsList
  }
  applyFilter (filter) {
    this.restrictions.getBanner(filter).then((banner) => {
      this.restrictionNotice = banner
    })

    let readingData:Array<any> = new Array()
    let invoiceData:Array<any> = new Array()
    let steps = []
    let counter = [1, 2, 3, 4, 5, 6]
    let restrictionStepLevels = []
    let normalisedReadingList = this.normaliseReadingList()
    counter.forEach((o) => {
      restrictionStepLevels.push(this.restrictions.getRestrictionStepLevel(filter, o, normalisedReadingList))
    })

    readingData = this.buildData(normalisedReadingList, filter)
    invoiceData = this.buildData(this.invoiceReadingsList, filter)

    restrictionStepLevels.forEach((level) => {
      steps.push([])
      readingData.forEach((item) => {
        steps[steps.length - 1].push({
          x: item.x,
          y: level
        })
      })
      invoiceData.forEach((item) => {
        steps[steps.length - 1].push({
          x: item.x,
          y: level
        })
      })
    })

    let _lineChartData:Array<any> = new Array()
    _lineChartData[0] = {
      data: readingData
    }
    _lineChartData[1] = {
      data: invoiceData
    }
    if (filter !== 'allTime') {
      _lineChartData[2] = {
        data: steps[0]
      }
      _lineChartData[3] = {
        data: steps[1]
      }
      _lineChartData[4] = {
        data: steps[2]
      }
      _lineChartData[5] = {
        data: steps[3]
      }
      _lineChartData[6] = {
        data: steps[4]
      }
    }
    this.lineChartData = _lineChartData;

    if (filter != 'allTime') {
      this.costEntries = this.restrictions.getCostEntries(filter, this.readingsList)
    }
    else {
      this.costEntries = []
    }
  }
  selectedThisMonth () {
      this.applyFilter('thisMonth')
  }
  selectedLastMonth () {
    this.applyFilter('lastMonth')
  }
  selectedAllTime () {
    this.applyFilter('allTime')
  }
  loadInvoice () {
    let addForm = this.modalCtrl.create(AddInvoiceForm);
    addForm.present();
  }
  loadReading () {
    let addForm = this.modalCtrl.create(AddReadingForm);
    addForm.present();
  }
}
