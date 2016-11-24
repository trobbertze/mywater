import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms'
import { NavController, LoadingController } from 'ionic-angular';
import { UserService } from '../../providers/user.service'
import { RestApiService } from '../../providers/restapi.service'
import { CitiesService } from '../../providers/cities.service'

declare let firebase: any

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public form : any
  email: any
  cities: any
  constructor(public navCtrl: NavController,
    private _fb: FormBuilder,
    public loadingCtrl: LoadingController,
    private restApi: RestApiService,
    private user: UserService,
    private citiesService: CitiesService) {
      let loader = this.loadingCtrl.create({
        content: 'Fetching settings...'
      });
      loader.present()
      this.user.get().then((user) => {
        this.email = user['email']
        this.form.controls['city'].setValue(user['city'])
      })
      this.cities = []
      citiesService.cityList().then(cities => {
        this.cities = cities
        loader.dismiss()
      })
      this.form = this._fb.group({
        city: ['', []]
      })
    }
    logOut () {
      this.user.logout()
    }
    saveSettings (model: any, isValid: boolean) {
      let loader = this.loadingCtrl.create({
        content: 'Saving settings...'
      });
      loader.present()
      this.user.set('city', this.form.controls['city'].value).then(() => {
        loader.dismiss()
      })
    }
}
