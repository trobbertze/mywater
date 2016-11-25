import async from 'async'

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
  filter: any
  restrictionNotice: any
  readingsList: any
  invoiceReadingsList: any
  costEntries: String[]
  showEmptyMessage: boolean
  emptyStatus: any
  emptyMessage: String
  isLoaded: boolean
  loader: any
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
      // this.restrictions.getBanner('thisMonth').then((banner) => {
      //   this.restrictionNotice = banner
      // })

      this.af.auth.subscribe(auth => {
        firebase.database().ref('/readings/' + auth.uid)
          .on('value', this.updateReadings.bind(this))
        firebase.database().ref('/invoices/' + auth.uid)
          .on('value', this.updateInvoices.bind(this))
      })
  }
  ionViewWillEnter () {
    if (this.emptyStatus['readings'] && this.emptyStatus['invoices']) {
      this.applyFilter(this.filter)
    } else {
      this.loader = this.loadingCtrl.create({
        content: 'Fetching data...'
      });
      this.loader.present()
    }
  }
  updateEmptyStatus (item, data) {
    this.ngZone.run(() => {
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
    })
  }
  updateInvoices (invoices) {
    invoices = invoices.val()
    this.updateEmptyStatus('invoices', invoices)
    this.invoiceReadingsList = []
    for(let key in invoices) {
      this.invoiceReadingsList.push({
        timestamp: invoices[key].periodEndDate,
        value: parseFloat(invoices[key].newReading),
      })
      this.invoiceReadingsList.push({
        timestamp: invoices[key].periodStartDate,
        value: parseFloat(invoices[key].previousReading),
      })
    }
    if (this.emptyStatus['readings']) {
      this.isLoaded = true
      if (this.loader)  this.loader.dismiss()
      this.applyFilter(this.filter)
    }
  }
  updateReadings (readings) {
    this.isLoaded = true
    readings = readings.val()
    this.updateEmptyStatus('readings', readings)
    this.readingsList = []
    for(let key in readings) {
      this.readingsList.push({
        timestamp: readings[key].timestamp,
        value: parseFloat(readings[key].value),
      })
    }
    if (this.emptyStatus['invoices']) {
      this.isLoaded = true
      if (this.loader) this.loader.dismiss()
      this.applyFilter(this.filter)
    }
  }
  public lineChartData:Array<any> = [
    {data: [], label: 'Real usage'}
  ]
  public lineChartOptions:any = {
    animation: {},
    responsive: true,
    legendCallback: function(chart) {
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

    let normalisedReadingList = this.normaliseReadingList()
    readingData = this.buildData(normalisedReadingList, filter)
    invoiceData = this.buildData(this.invoiceReadingsList, filter)

    let setRestrictionStepLevels = function(done) {
      let restrictionStepLevels = []
      let counter = [1, 2, 3, 4, 5, 6]
      async.each(counter,
        (o , callback) => {
          this.restrictions.getRestrictionStepLevel(filter, o, normalisedReadingList)
            .then(level => {
              restrictionStepLevels.push(level)
              callback()
          })
        }, (err) => {
          if (err) console.log(err)
          done(err, restrictionStepLevels)
        }
      )
    }.bind(this)

    let buildSteps = function(restrictionStepLevels, done) {
      let steps = []
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
      done(null, steps)
    }.bind(this)

    let buildLineChartData = function(steps, done) {
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
        console.log('done')
        done()
    }.bind(this)

    let buildCosts = function() {
      if (filter != 'allTime') {
        this.restrictions.getCostEntries(filter, this.readingsList).then(costEntries => {
          this.costEntries = costEntries
        })
      }
      else {
        this.costEntries = []
      }
    }.bind(this)

    async.waterfall([
      setRestrictionStepLevels,
      buildSteps,
      buildLineChartData,
      buildCosts
    ])
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
