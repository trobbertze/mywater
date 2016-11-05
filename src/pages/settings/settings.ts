import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFire } from 'angularfire2';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  constructor(public navCtrl: NavController,
    public af: AngularFire) {}
    logOut () {
      this.af.auth.logout()
    }
}
