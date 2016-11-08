import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { ValidationService } from '../providers/validation.service';

import { MyApp } from './app.component';
import { LandingPage } from '../pages/auth/landing/landing';
import { LoginPage } from '../pages/auth/login/login';
import { SignUpPage } from '../pages/auth/signup/signup';
import { ResetPasswordPage } from '../pages/auth/resetPassword/resetPassword';
import { ReadingsPage } from '../pages/readings/readings';
import { AddReadingForm } from '../pages/readings/add-reading-form/add-reading-form';
import { InvoicesPage } from '../pages/invoices/invoices';
import { StatsPage } from '../pages/stats/stats';
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';

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
    StatsPage,
    SettingsPage,
    TabsPage
  ],
  imports: [
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
    StatsPage,
    SettingsPage,
    TabsPage
  ],
  providers: [
    ValidationService
  ]
})
export class AppModule {}
