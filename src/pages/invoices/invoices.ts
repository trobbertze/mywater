import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController } from 'ionic-angular';
import {AngularFire, FirebaseListObservable } from 'angularfire2';

import { AddInvoiceForm } from './add-invoice-form/add-invoice-form'

@Component({
  selector: 'page-invoices',
  templateUrl: 'invoices.html'
})
export class InvoicesPage {
  invoices: FirebaseListObservable<any>
  auth: any
  authSubscription: any
  constructor(public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private af: AngularFire) {

  }
  ionViewWillEnter () {
    this.authSubscription = this.af.auth.subscribe(auth => {
      this.auth = auth
      if (this.auth && !this.invoices) {
        let loader = this.loadingCtrl.create({
          content: 'Fetching invoices...'
        });
        loader.present()
        this.invoices = this.af.database.list('/invoices/' + this.auth.uid, {
          query: {
            orderByChild: 'timestamp'
          }
        })

        this.invoices.subscribe(
          (invoices) => loader.dismiss(),
          (err) => console.log(err)
        )
      }
    })
  }
  ionViewDidLeave () {
    this.authSubscription.unsubscribe()
  }
  showAddModal () {
    let addForm = this.modalCtrl.create(AddInvoiceForm);
    addForm.present();
  }
  deleteInvoice (invoice) {
    let alert = this.alertCtrl.create({
      title: 'Are you sure?',
      subTitle: 'Are you sure you want to remove this invoice?',
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            alert.dismiss()
          }
        },
        {
          text: 'Confirm',
          handler: data => {
            this.invoices.remove(invoice.$key)
          }
        }
      ]
    })
    alert.present();
  }
  editInvoice (invoice) {
    let addForm = this.modalCtrl.create(AddInvoiceForm, {invoice: invoice});
    addForm.present();
  }
}
