import { Injectable }    from '@angular/core'
import { Http } from '@angular/http'
import { CitiesService } from './cities.service'

declare let firebase: any
declare let moment: any

let LEVELS = [6, 10.5, 20, 35, 50]
let LEVELCOST = {
  1 : [0, 14.89, 17.41, 25.8, 31.86, 42.03],
  2 : [0, 15.68, 20.02, 32.65, 48.93, 93.39],
  3 : [0, 16.54, 23.54, 40.96, 66.41, 200.16]
}

@Injectable()
export class RestrictionLevelsService {
  constructor(private http: Http,
    private cities: CitiesService) {
  }
  getRestrictionLevel (forMonth) {
    return new Promise((accept, reject) => {
      this.cities.getRestrictionLevels().then((restrictions: Array<{}>) => {
        // console.log(restrictions)
        let forMonthStamp = this.getMonthStartEnd(forMonth).start
        // console.log(forMonthStamp)
        let restrictionEntry = restrictions.find((o) => {
          console.log('-----------------')
          console.log(o)
          console.log(forMonthStamp)
          return o['timeStamp'] === forMonthStamp
        })
        if (restrictionEntry) {
          accept(restrictionEntry['level'])
        }
        accept(1)
      })
    })
  }
  getMonthStartEnd (forMonth) {
    let startEnd:any = {}
    if (forMonth === 'thisMonth') {
      startEnd.start = moment().startOf('month').valueOf()
      startEnd.end = moment(startEnd.start).endOf('month').valueOf()
    }
    else if (forMonth === 'lastMonth') {
      startEnd.start = moment().subtract(1, 'months').startOf('month').valueOf()
      startEnd.end = moment(startEnd.start).endOf('month').valueOf()
    }
    return startEnd
  }
  evaluateLinear (pointToEvaluate, data) {
    function findIntervalLeftBorderIndex (point, intervals) {
      //If point is beyond given intervals
      if (point < intervals[0])
        return 0
      if (point > intervals[intervals.length - 1])
        return intervals.length - 1
      //If point is inside interval
      //Start searching on a full range of intervals
      var indexOfNumberToCompare
        , leftBorderIndex = 0
        , rightBorderIndex = intervals.length - 1
      //Reduce searching range till it find an interval point belongs to using binary search
      while (rightBorderIndex - leftBorderIndex !== 1) {
        indexOfNumberToCompare = leftBorderIndex + Math.floor((rightBorderIndex - leftBorderIndex)/2)
        point >= intervals[indexOfNumberToCompare]
          ? leftBorderIndex = indexOfNumberToCompare
          : rightBorderIndex = indexOfNumberToCompare
      }
      return leftBorderIndex
    }
    function linearInterpolation (x, x0, y0, x1, y1) {
      var a = (y1 - y0) / (x1 - x0)
      var b = -a * x0 + y0
      return a * x + b
    }
    if (data.length > 1) {
      let functionValuesX = []
      let functionValuesY = []
      data.forEach((entry) => {
        functionValuesX.push(entry.timestamp)
        functionValuesY.push(parseFloat(entry.value))
      })
      var index = findIntervalLeftBorderIndex(pointToEvaluate, functionValuesX)
      if (index == functionValuesX.length - 1)
        index--
      return linearInterpolation(pointToEvaluate, functionValuesX[index], functionValuesY[index]
        , functionValuesX[index + 1], functionValuesY[index + 1])
    }
  }
  getBeginningOfMonthReading (forMonth, data) {
    let monthStartEndDates = this.getMonthStartEnd(forMonth)
    data = data.sort((a, b) => a.timestamp - b.timestamp )
    return this.evaluateLinear(monthStartEndDates.start, data)
  }
  getEndOfMonthReading (forMonth, data) {
    let monthStartEndDates = this.getMonthStartEnd(forMonth)
    data = data.sort((a, b) => a.timestamp - b.timestamp )
    return this.evaluateLinear(monthStartEndDates.end, data)
  }
  getReadingsForMonth (forMonth, data) {
    let returnData = []
    data.forEach((reading) => {
      if (forMonth === 'thisMonth' && (moment(reading.timestamp).month() === moment().month())) {
        returnData.push(reading)
      }
      else if (forMonth === 'lastMonth' && (moment(reading.timestamp).month() === (moment().month() - 1))) {
        returnData.push(reading)
      }
    })
    if (forMonth === 'lastMonth') {
      let month = this.getMonthStartEnd(forMonth)
      returnData.push({
        timestamp: month.start,
        value: this.getBeginningOfMonthReading(forMonth, data)
      })
      returnData.push({
        timestamp: month.end,
        value: this.getEndOfMonthReading(forMonth, data)
      })
    }
    else if (forMonth === 'thisMonth') {
      let month = this.getMonthStartEnd(forMonth)
      returnData.push({
        timestamp: month.start,
        value: this.getBeginningOfMonthReading(forMonth, data)
      })
    }
    returnData = returnData.sort((a, b) => a.timestamp - b.timestamp )
    return returnData
  }
  getRestrictionStepLevel (forMonth, step, data) {
    return new Promise((accept, reject) => {
      let startLevel = this.getBeginningOfMonthReading(forMonth, data)
      this.cities.getLevels().then(levels => {
        accept(startLevel + levels[step - 1])
      })
    })
  }
  format (number, decimals, sections) {
      var re = '\\d(?=(\\d{' + (sections || 3) + '})+' + (decimals > 0 ? '\\.' : '$') + ')';
      return number.toFixed(Math.max(0, ~~decimals)).replace(new RegExp(re, 'g'), '$&,');
  };
  getCostForStep (step, levelCosts, value, restrictionLevel) {
    return {
      string: 'Step ' + (step + 1) + ': ' +
              this.format(value, 3, 3) + 'kl @ ' +
              'R' + this.format(levelCosts[restrictionLevel - 1][step], 2, 3) +
              ' = R' + this.format(value * levelCosts[restrictionLevel - 1][step], 2, 3),
      value: value * levelCosts[restrictionLevel - 1][step]
    }
  }
  getCostEntries (forMonth, data) {
    return new Promise((accept, reject) => {
      let costEntries = []
      let readings = this.getReadingsForMonth(forMonth, data)
      let totalReading = parseFloat(readings[readings.length - 1].value) - parseFloat(readings[0].value)
      let step = 0
      let totalCost = 0

      this.cities.getLevels().then(levels => {
        this.cities.getLevelCosts().then(levelCosts => {
          this.getRestrictionLevel(forMonth).then(restrictionLevel => {
            while (totalReading > 0) {
              if (totalReading - levels[step] > 0) {
                let cost = this.getCostForStep(step, levelCosts, levels[step], restrictionLevel)
                costEntries.push(cost.string)
                totalCost += cost.value
              } else {
                let cost = this.getCostForStep(step, levelCosts, totalReading, restrictionLevel)
                costEntries.push(cost.string)
                totalCost += cost.value
              }
              totalReading -= levels[step]
              step++
            }
            costEntries.push('Total: R' + this.format(totalCost, 2, 3))
            accept(costEntries)
          })
        })
      })
    })
  }
  getBanner (forMonth) {
    return new Promise((accept, reject) => {
      this.getRestrictionLevel(forMonth).then(restrictionlevel => {
        switch (restrictionlevel) {
          case 1:
            accept('Level 1 (10% savings) reduction tariffs apply')
          case 2:
            accept('Level 2 (20% savings) reduction tariffs apply')
          case 3:
            accept('Level 3 (30% savings) reduction tariffs apply')
          default:
            accept(null)
        }
      })
    })
  }
}
