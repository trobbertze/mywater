import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule }    from '@angular/http';
import { AngularFireModule } from 'angularfire2';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { ValidationService } from '../providers/validation.service';
import { RestrictionLevelsService } from '../providers/restrictionLevel.service';

import { SortByDatePipe }  from '../pipes/sortByDate.pipe'
import { MomentCalendarPipe }  from '../pipes/momentCalendar.pipe'

import { MyApp } from './app.component';
import { LandingPage } from '../pages/auth/landing/landing';
import { LoginPage } from '../pages/auth/login/login';
import { SignUpPage } from '../pages/auth/signup/signup';
import { ResetPasswordPage } from '../pages/auth/resetPassword/resetPassword';
import { ReadingsPage } from '../pages/readings/readings';
import { AddReadingForm } from '../pages/readings/add-reading-form/add-reading-form';
import { InvoicesPage } from '../pages/invoices/invoices';
import { AddInvoiceForm } from '../pages/invoices/add-invoice-form/add-invoice-form';
import { StatsPage } from '../pages/stats/stats';
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';

import { InvoiceHelpPage } from '../pages/invoices/invoice-help/invoice-help'
import { ReadingsHelpPage } from '../pages/readings/readings-help/readings-help'

export const firebaseConfig = {
  apiKey: 'AIzaSyCxZ7rPWfb1q91SQuKpb39OiMyquqD9Uvc',
  authDomain: 'mywater-bc113.firebaseapp.com',
  databaseURL: 'https://mywater-bc113.firebaseio.com',
  storageBucket: 'mywater-bc113.appspot.com',
  messagingSenderId: '437963751654'
};

@NgModule({
  declarations: [
    MyApp,
    LandingPage,
    LoginPage,
    SignUpPage,
    ResetPasswordPage,
    ReadingsPage,
    AddReadingForm,
    InvoicesPage,
    AddInvoiceForm,
    StatsPage,
    SettingsPage,
    TabsPage,
    InvoiceHelpPage,
    ReadingsHelpPage,
    SortByDatePipe,
    MomentCalendarPipe
  ],
  imports: [
    HttpModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    ReactiveFormsModule,
    MomentModule,
    ChartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LandingPage,
    LoginPage,
    SignUpPage,
    ResetPasswordPage,
    ReadingsPage,
    AddReadingForm,
    InvoicesPage,
    AddInvoiceForm,
    StatsPage,
    SettingsPage,
    TabsPage,
    InvoiceHelpPage,
    ReadingsHelpPage
  ],
  providers: [
    ValidationService,
    RestrictionLevelsService
  ]
})
export class AppModule {}
