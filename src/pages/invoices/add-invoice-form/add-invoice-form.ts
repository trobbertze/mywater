import { Component } from '@angular/core'
import { NavController, ViewController, ModalController,
  AlertController, LoadingController, NavParams  } from 'ionic-angular'
import { FormBuilder, Validators } from '@angular/forms'
import { AngularFire } from 'angularfire2'

import { InvoiceHelpPage } from '../invoice-help/invoice-help'

declare let firebase: any
declare let moment: any

@Component({
  selector: 'page-add-invoice-form',
  templateUrl: 'add-invoice-form.html'
})
export class AddInvoiceForm {
  public form : any
  submitted: boolean = false
  auth: any
  authSubscription: any
  editInvoice: any
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private _fb: FormBuilder,
    private af: AngularFire,
    params: NavParams
  ) {
    this.form = this._fb.group({
      newReading: ['', [<any>Validators.required]],
      previousReading: ['', [<any>Validators.required]],
      periodStartDate: [''],
      periodEndDate: ['']
    })
    this.editInvoice = params.get('invoice')
    if (this.editInvoice) {
      this.form.controls['newReading'].setValue(this.editInvoice.newReading)
      this.form.controls['previousReading'].setValue(this.editInvoice.previousReading)
      this.form.controls['periodStartDate'].setValue(moment(this.editInvoice.periodStartDate).format('YYYY-MM-DDTHH:mmZ'))
      this.form.controls['periodEndDate'].setValue(moment(this.editInvoice.periodEndDate).format('YYYY-MM-DDTHH:mmZ'))
    }
  }
  ionViewWillEnter () {
    this.authSubscription = this.af.auth.subscribe(auth => this.auth = auth)
  }
  ionViewDidLeave () {
    this.authSubscription.unsubscribe()
  }
  saveInvoice (model: any, isValid: boolean) {
    this.submitted = true
    if (isValid) {
      let loader = this.loadingCtrl.create({
        content: 'Saving invoice...'
      });
      loader.present()
      let invoices = this.af.database.list('/invoices/' + this.auth.uid);
      let promise
      if (this.editInvoice) {
        promise = invoices.update(this.editInvoice.$key, {
          newReading: this.form.controls['newReading'].value,
          previousReading: this.form.controls['previousReading'].value,
          periodStartDate: moment(this.form.controls['periodStartDate'].value, 'YYYY-MM-DDTHH:mmZ').valueOf(),
          periodEndDate: moment(this.form.controls['periodEndDate'].value, 'YYYY-MM-DDTHH:mmZ').valueOf()
        })
      } else {
        promise = invoices.push({
          newReading: this.form.controls['newReading'].value,
          previousReading: this.form.controls['previousReading'].value,
          periodStartDate: moment(this.form.controls['periodStartDate'].value, 'YYYY-MM-DDTHH:mmZ').valueOf(),
          periodEndDate: moment(this.form.controls['periodEndDate'].value, 'YYYY-MM-DDTHH:mmZ').valueOf()
        })
      }
      promise
        .then(_ => {
          loader.dismiss()
          this.dismiss()
        }).catch(err => {
          let alert = this.alertCtrl.create({
            title: 'Entry error',
            subTitle: err.message,
            buttons: ['OK']
          })
          alert.present();
        });
    } else {
      let alert = this.alertCtrl.create({
        title: 'Validation error',
        subTitle: 'There are errors in your inputs. Please review and resubmit.',
        buttons: ['OK']
      })
      alert.present();
    }
  }
  dismiss () {
    this.viewCtrl.dismiss()
  }
  showHelp () {
    let addForm = this.modalCtrl.create(InvoiceHelpPage);
    addForm.present();
  }

}
