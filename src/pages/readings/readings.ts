import { Component, NgZone } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController } from 'ionic-angular';
import {AngularFire, FirebaseListObservable } from 'angularfire2';

import { AddReadingForm } from './add-reading-form/add-reading-form'

@Component({
  selector: 'page-readings',
  templateUrl: 'readings.html'
})
export class ReadingsPage {
  readings: FirebaseListObservable<any>
  auth: any
  authSubscription: any
  showEmpty: boolean
  readingsCounter: any
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
      if (this.auth && !this.readings) {
        let loader = this.loadingCtrl.create({
          content: 'Fetching meter readings...'
        });
        loader.present()
        this.readings = this.af.database.list('/readings/' + this.auth.uid, {
          query: {
            orderByChild: 'timestamp'
          }
        })

        this.readings.subscribe(
          (readings) => {
            this.readingsCounter = readings.length
            setTimeout(() => {
              this.ngZone.run(() => {
                loader.dismiss()
                if (this.readingsCounter === 0) {
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
    let addForm = this.modalCtrl.create(AddReadingForm);
    addForm.present();
  }
  deleteReading (reading) {
    let alert = this.alertCtrl.create({
      title: 'Are you sure?',
      subTitle: 'Are you sure you want to remove this meter reading?',
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
            this.readings.remove(reading.$key)
          }
        }
      ]
    })
    alert.present();
  }
  editReading (reading) {
    let addForm = this.modalCtrl.create(AddReadingForm, {reading: reading});
    addForm.present();
  }
}
