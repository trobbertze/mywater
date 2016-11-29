import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms'
import { NavController, LoadingController, ViewController } from 'ionic-angular';
import { UserService } from '../../providers/user.service'
import { RestApiService } from '../../providers/restapi.service'
import { CitiesService } from '../../providers/cities.service'

declare let firebase: any

@Component({
  selector: 'page-signup-settings',
  templateUrl: 'signUpSettings.html'
})
export class SignUpSettingsPage {
  public form : any
  cities: any
  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    private _fb: FormBuilder,
    public loadingCtrl: LoadingController,
    private restApi: RestApiService,
    private user: UserService,
    private citiesService: CitiesService) {
      let loader = this.loadingCtrl.create({
        content: 'Fetching settings...'
      });
      loader.present()
      this.cities = []
      citiesService.cityList().then(cities => {
        this.cities = cities
        loader.dismiss()
      })
      this.form = this._fb.group({
        city: ['', []]
      })
    }
    saveSettings (model: any, isValid: boolean) {
      let loader = this.loadingCtrl.create({
        content: 'Saving settings...'
      });
      loader.present()
      this.user.set('city', this.form.controls['city'].value).then(() => {
        loader.dismiss()
        this.viewCtrl.dismiss()
      })
    }
}
