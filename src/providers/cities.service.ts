import { Injectable }    from '@angular/core';
import { RestApiService } from './restapi.service'
import { UserService } from './user.service'

@Injectable()
export class CitiesService {
  cities: any
  constructor(private user: UserService,
    private restApi: RestApiService) {
      this.fetch()
  }
  fetch () {
    return new Promise((resolve, reject) => {
      this.user.get().then((user) => {
        this.restApi.get({
          url: 'cities',
          authToken: user['authToken']
        }).then(result => {
          this.cities = result
          resolve(this.cities)
        })
      })
    })
  }
  cityList () {
    let _cityList = function () {
      let list = []
      this.cities.forEach((item, counter) => {
        list.push({
          id: counter,
          name: item.name
        })
      })
      return list
    }.bind(this)
    return new Promise((resolve, reject) => {
      if (this.cities) resolve(_cityList())
      else {
        this.fetch().then(() => resolve(_cityList()) )
      }
    })
  }
}
