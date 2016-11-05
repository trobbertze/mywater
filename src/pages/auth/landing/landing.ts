import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SignUpPage } from '../signup/signup';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html'
})
export class LandingPage {
  form : any
  constructor(public nav: NavController) {}
  gotoLogin () {
    this.nav.push(LoginPage)
  }
  gotSignUp () {
    this.nav.push(SignUpPage)
  }
}
