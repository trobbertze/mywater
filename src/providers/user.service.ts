import _ from 'lodash'
import { Injectable }    from '@angular/core';
import { AngularFire } from 'angularfire2'
import { RestApiService } from './restapi.service'

// declare let firebase: any

@Injectable()
export class UserService {
  user: any
  settings: any
  auth: any
  constructor(private af: AngularFire,
  private restApi: RestApiService) {}
  get () {
    return new Promise((resolve, reject) => {
      if (this.user) {
        resolve(this.user)
      } else {
        this.af.auth.subscribe((auth) => {
          this.auth = auth
          this.getUserSettings().then(() => {
            resolve(this.user)
          })
        })
      }
    })
  }
  set (key, value) {
    return new Promise((accept, reject) => {
      if (!this.settings) {
        this.settings = {}
      }
      this.settings[key] = value
      this.restApi.put({
        url: 'settings',
        uid: this.auth.uid,
        authToken: this.auth.auth.kd
      }, this.settings).then(result => {
        accept(result)
      })
    })
  }
  logout () {
    this.af.auth.logout()
  }
  private getUserSettings () {
    return new Promise((resolve, reject) => {
      if (!this.auth) {
        reject('Cannot call getUserSettings if auth has not been created')
      }
      this.restApi.get({
        url: 'settings',
        uid: this.auth.uid,
        authToken: this.auth.auth.kd
      }).then((result) => {
        this.buildUser(result)
        resolve(this.user)
      })
    })
  }
  private buildUser (settings) {
    this.user = {
      email: this.auth.auth.email,
      uid: this.auth.auth.uid,
      authToken: this.auth.auth.kd
    }
    this.settings = settings
    _.merge(this.user, settings)
  }
}
