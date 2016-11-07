import { Component } from '@angular/core';
import { NavController, ViewController,
  AlertController, LoadingController, NavParams  } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFire } from 'angularfire2';

declare let firebase: any;

@Component({
  selector: 'page-add-reading-form',
  templateUrl: 'add-reading-form.html'
})
export class AddReadingForm {
  public form : any
  submitted: boolean = false
  auth: any
  authSubscription: any
  editReading: any
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private _fb: FormBuilder,
    private af: AngularFire,
    params: NavParams
  ) {
    this.form = this._fb.group({
      reading: ['', [<any>Validators.required]]
    })
    this.editReading = params.get('reading')
    if (this.editReading) {
      this.form.controls['reading'].setValue(this.editReading.value)
    }
  }
  ionViewWillEnter () {
    this.authSubscription = this.af.auth.subscribe(auth => this.auth = auth)
  }
  ionViewDidLeave () {
    this.authSubscription.unsubscribe()
  }
  saveReading (model: any, isValid: boolean) {
    this.submitted = true
    if (isValid) {
      let loader = this.loadingCtrl.create({
        content: 'Saving meter reading...'
      });
      loader.present()
      let readings = this.af.database.list('/readings/' + this.auth.uid);
      let promise
      if (this.editReading) {
        promise = readings.update(this.editReading.$key, {
          value: this.form.controls['reading'].value,
          timestamp: this.editReading.timestamp
        })
      } else {
        promise = readings.push({
          value: this.form.controls['reading'].value,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        })
      }
      promise
        .then(_ => {
          loader.dismiss()
          this.dismiss()
        }).catch(err => {
          let alert = this.alertCtrl.create({
            title: 'Entry error',
            subTitle: err.message,
            buttons: ['OK']
          })
          alert.present();
        });
    } else {
      let alert = this.alertCtrl.create({
        title: 'Validation error',
        subTitle: 'There are errors in your inputs. Please review and resubmit.',
        buttons: ['OK']
      })
      alert.present();
    }
  }
  dismiss () {
    this.viewCtrl.dismiss()
  }

}
