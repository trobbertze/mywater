import { Injectable }    from '@angular/core'
import { Http } from '@angular/http'

import 'rxjs/add/operator/toPromise'

declare let firebase: any

@Injectable()
export class RestApiService {
  private api =   firebase.database().ref().toString()
  constructor(private http: Http) {}
  get (options) {
    return new Promise((resolve, reject) => {
      let url = this.makeUrl(options)
      this.http.get(url).toPromise().then(response => {
        resolve(response.json())
      })
    })
  }
  put (options, data) {
    return new Promise((resolve, reject) => {
      let url = this.makeUrl(options)
      this.http.put(url, data).toPromise().then(response => {
        resolve(response.json())
      })
    })
  }
  post (options, data) {
    return new Promise((resolve, reject) => {
      let url = this.makeUrl(options)
      this.http.post(url, data).toPromise().then(response => {
        resolve(response.json())
      })
    })
  }
  private makeUrl (options) {
    let url = this.api
    url += options.url ? options.url : ''
    url += options.uid ? '/' + options.uid : ''
    url += '.json'
    url += options.authToken ? '?auth=' + options.authToken : ''
    return url
  }
}
