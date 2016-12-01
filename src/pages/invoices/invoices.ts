import { Component, NgZone } from '@angular/core';
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
  showEmpty: boolean
  invoicesCounter: any
  constructor(public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private af: AngularFire,
    private ngZone: NgZone) {
      this.showEmpty = false
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
          (invoices) => {
            this.invoicesCounter = invoices.length
            setTimeout(() => {
              this.ngZone.run(() => {
                loader.dismiss()
                if (this.invoicesCounter === 0) {
                  this.showEmpty = true
                } else {
                  this.showEmpty = false
                }
              })
            }, 100)
          },
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
  editInvoice (invoice) {
    let addForm = this.modalCtrl.create(AddInvoiceForm, {invoice: invoice});
    addForm.present();
  }
}
