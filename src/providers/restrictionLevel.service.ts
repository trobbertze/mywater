import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

declare let moment: any

@Injectable()
export class RestrictionLevelsService {
  private url = 'https://mywater-bc113.firebaseio.com/restrictionLevels.json';
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
    let forMonthStamp
    if (forMonth === 'thisMonth') {
      forMonthStamp = moment().startOf('month').valueOf()
    }
    else if (forMonth === 'lastMonth') {
      forMonthStamp = moment().subtract(1, 'months').startOf('month').valueOf()
    }

    let restrictionEntry = this.restrictions.find((o) => o.timestamp === forMonthStamp)

    if (restrictionEntry) {
      return restrictionEntry.level
    }

    return 1
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
