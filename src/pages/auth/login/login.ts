import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController  } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';
import { Facebook } from 'ionic-native';

import { ValidationService } from '../../../providers/validation.service';
import { SignUpPage } from '../signup/signup';
import { ResetPasswordPage } from '../resetPassword/resetPassword';

declare let firebase: any;

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  public form : any
  submitted: boolean = false
  email: any
  password: any
  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public af: AngularFire,
    private _fb: FormBuilder) {
      this.form = this._fb.group({
        email: ['', [<any>Validators.required, <any>ValidationService.emailValidator]],
        password: ['', [<any>Validators.required, <any>Validators.minLength(5)]]
      })
  }
  loginFacebook () {
    let loader = this.loadingCtrl.create({
      content: 'Signing in...'
    });
    loader.present()
    Facebook.login(['public_profile', 'email', 'user_friends']).then(success => {
        let creds = firebase.auth.FacebookAuthProvider.credential(success.authResponse.accessToken);
        this.af.auth.login(creds, {
          provider: AuthProviders.Facebook,
          method: AuthMethods.OAuthToken
        }).then(success => {
          loader.dismiss()
        }).catch(error => {
          loader.dismiss()
          this.showError(error)
        });
      }).catch(error => {
        loader.dismiss()
        this.showError(error)
      });
  }
  login (model: any, isValid: boolean) {
    this.submitted = true
    if (isValid) {
      let loader = this.loadingCtrl.create({
        content: 'Signing in...'
      });
      loader.present()
      this.af.auth.login({
        email: this.form.controls['email'].value,
        password: this.form.controls['password'].value,
      },
      {
        provider: AuthProviders.Password,
        method: AuthMethods.Password,
      }).then( success => {
        loader.dismiss()
      }).catch(error => {
        loader.dismiss()
        this.showError(error)
      })
    } else {
      let alert = this.alertCtrl.create({
        title: 'Validation error',
        subTitle: 'There are errors in your inputs. Please review and resubmit.',
        buttons: ['OK']
      })
      alert.present();
    }
  }
  singUp () {
    this.nav.push(SignUpPage)
  }
  gotoResetPassword () {
    this.nav.push(ResetPasswordPage)
  }
  showError (error) {
    let alert = this.alertCtrl.create({
      title: 'Sign up error',
      subTitle: error.message,
      buttons: ['OK']
    });
    alert.present();
  }
}
