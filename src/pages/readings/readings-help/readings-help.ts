import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-readings-help',
  templateUrl: 'readings-help.html'
})
export class ReadingsHelpPage {

  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController) {}
  dismiss () {
    this.viewCtrl.dismiss()
  }
}
