import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { AngularFire, AuthMethods, AuthProviders } from 'angularfire2';
import { Facebook} from 'ionic-native';

import { ValidationService } from '../../../providers/validation.service';
declare let firebase: any;

var password

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignUpPage {
  form : any
  submitted: boolean = false
  password: string = ''
  constructor (
    public nav: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public af: AngularFire,
    private _fb: FormBuilder) {
      this.form = this._fb.group({
        email: ['', [<any>Validators.required, <any>ValidationService.emailValidator]],
        password: ['', [<any>Validators.required, <any>Validators.minLength(5)]],
        confirmPassword: ['', [<any>Validators.required, <any>Validators.minLength(5),(control: FormControl) => {
          let val: any
          if (control.value == password) {
            val = null
          } else {
            val = {dontMatch: true}
          }
          return val
        }]]
      })
  }
  onPasswordChange() {
    password = this.form.controls['password'].value
  }
  // TODO: Cannot sign up with Google
  signUpGoogle () {
    let loader = this.loadingCtrl.create({
      content: 'Creating your account...'
    })
    loader.present()
    this.af.auth.login({
      provider: AuthProviders.Google,
      method: AuthMethods.Popup
    }).then(success => {
      loader.dismiss()
    }).catch(error => {
      loader.dismiss()
      this.showError(error)
    });
  }
  signUpFacebook () {
    let loader = this.loadingCtrl.create({
      content: 'Creating your account...'
    })
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
  signUp (model: any, isValid: boolean) {
    this.submitted = true
    if (isValid) {
      let loader = this.loadingCtrl.create({
        content: 'Creating your account...'
      })
      loader.present()
      this.af.auth.createUser({
        email: this.form.controls.email.value,
        password: this.form.controls.password.value
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
  showError (error) {
    let alert = this.alertCtrl.create({
      title: 'Sign up error',
      subTitle: error.message,
      buttons: ['OK']
    });
    alert.present();
  }
}
