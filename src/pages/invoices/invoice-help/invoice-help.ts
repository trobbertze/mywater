import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-invoices-help',
  templateUrl: 'invoice-help.html'
})
export class InvoiceHelpPage {

  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController) {}
  dismiss () {
    this.viewCtrl.dismiss()
  }
}
