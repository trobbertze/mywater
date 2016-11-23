import { Injectable }    from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

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
  private url =   firebase.database().ref().toString() + '/restrictionLevels.json';
  private restrictions: any[] = []
  constructor(private http: Http) {
  }
  refresh (): Promise<any[]> {
    return this.http.get(this.url)
     .toPromise()
     .then(response => {
       let data = response.json();
       data.forEach((item) => {
         if (item) this.restrictions.push(item)
       })
     })
     .catch((err) => console.log(err));
  }
  getRestrictionLevel (forMonth) {
    let forMonthStamp = this.getMonthStartEnd(forMonth).start
    let restrictionEntry = this.restrictions.find((o) => o.timestamp === forMonthStamp)
    if (restrictionEntry) {
      return restrictionEntry.level
    }
    return 1
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
    let startLevel = this.getBeginningOfMonthReading(forMonth, data)
    switch (step) {
      case 1:
        return startLevel + LEVELS[0]
      case 2:
        return startLevel + LEVELS[1]
      case 3:
        return startLevel + LEVELS[2]
      case 4:
        return startLevel + LEVELS[3]
      case 5:
        return startLevel + LEVELS[4]
    }
  }
  format (number, decimals, sections) {
      var re = '\\d(?=(\\d{' + (sections || 3) + '})+' + (decimals > 0 ? '\\.' : '$') + ')';
      return number.toFixed(Math.max(0, ~~decimals)).replace(new RegExp(re, 'g'), '$&,');
  };
  getCostForStep (forMonth, step, value) {
    let restrictionLevel = this.getRestrictionLevel(forMonth)
    return {
      string: 'Step ' + (step + 1) + ': ' +
              this.format(value, 3, 3) + 'kl @ ' +
              'R' + this.format(LEVELCOST[restrictionLevel][step], 2, 3) +
              ' = R' + this.format(value * LEVELCOST[restrictionLevel][step], 2, 3),
      value: value * LEVELCOST[restrictionLevel][step]
    }
  }
  getCostEntries (forMonth, data) {
    let costEntries = []
    let readings = this.getReadingsForMonth(forMonth, data)
    let totalReading = parseFloat(readings[readings.length - 1].value) - parseFloat(readings[0].value)
    let step = 0
    let totalCost = 0
    while (totalReading > 0) {
      if (totalReading - LEVELS[step] > 0) {
        let cost = this.getCostForStep(forMonth, step, LEVELS[step])
        costEntries.push(cost.string)
        totalCost += cost.value
      } else {
        let cost = this.getCostForStep(forMonth, step, totalReading)
        costEntries.push(cost.string)
        totalCost += cost.value
      }
      totalReading -= LEVELS[step]
      step++
    }
    costEntries.push('Total: R' + this.format(totalCost, 2, 3))
    return costEntries
  }
  getBanner (forMonth) {
    let _getBanner = (forMonth) => {
      let restrictionlevel = this.getRestrictionLevel(forMonth)
      switch (restrictionlevel) {
        case 1:
          return 'Level 1 (10% savings) reduction tariffs apply'
        case 2:
          return 'Level 2 (20% savings) reduction tariffs apply'
        case 3:
          return 'Level 3 (30% savings) reduction tariffs apply'
        default:
          return null
      }
    }
    return new Promise((resolve, reject) => {
      if (this.restrictions.length !== 0) {
        resolve(_getBanner(forMonth))
      } else {
        this.refresh()
        .then(() => resolve(_getBanner(forMonth)))
      }
    })

  }
}
