import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { AngularFire } from 'angularfire2';

import { ValidationService } from '../../../providers/validation.service';

import { LandingPage } from '../landing/landing';

declare let firebase: any;

@Component({
  selector: 'page-resetPassword',
  templateUrl: 'resetPassword.html'
})
export class ResetPasswordPage {
  public form : any
  submitted: boolean = false
  public email: any
  constructor(
    public nav: NavController,
    public af: AngularFire,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private _fb: FormBuilder) {
      this.form = this._fb.group({
        email: ['', [<any>Validators.required, <any>ValidationService.emailValidator]],
      })
  }
  resetPassword (model: any, isValid: boolean) {
    this.submitted = true
    let loader = this.loadingCtrl.create({
      content: 'Checking email...'
    });
    firebase.auth().sendPasswordResetEmail(this.form.controls['email'].value)
      .then(() => {
        loader.dismiss()
        let alert = this.alertCtrl.create({
          title: 'Password reset success.',
          subTitle: 'Please check your email inbox for a password reset email',
          buttons: ['OK']
        });
        alert.present().then(() => {
          this.nav.setRoot(LandingPage)
        });
      }, (error) => {
        loader.dismiss()
        let alert = this.alertCtrl.create({
          title: 'Password reset error.',
          subTitle: error.message,
          buttons: ['OK']
        });
        alert.present();
      })

  }
  backToSignUp () {
    this.nav.pop()
  }
}
