import { Component, ViewChild } from '@angular/core'
import { Platform, Nav } from 'ionic-angular'
import { Splashscreen, StatusBar } from 'ionic-native'

import { AngularFire } from 'angularfire2'

import { TabsPage } from '../pages/tabs/tabs'
import { LandingPage } from '../pages/auth/landing/landing'


@Component({
  template: `<ion-nav [root]="rootPage" swipeBackEnabled="false"></ion-nav>`
})
export class MyApp {
  @ViewChild(Nav) nav: Nav
  rootPage: any
  constructor(platform: Platform, private af: AngularFire) {
      platform.ready().then(() => {
         this.af.auth.subscribe((auth) => {
           if(auth) {
             this.nav.setRoot(TabsPage)
           } else {
             this.nav.setRoot(LandingPage)
           }
           setTimeout(() => Splashscreen.hide(), 5)
         })
        StatusBar.styleDefault();
    });
  }
}
