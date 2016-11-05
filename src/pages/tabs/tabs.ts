import { Component } from '@angular/core';

import { StatsPage } from '../stats/stats';
import { ReadingsPage } from '../readings/readings';
import { InvoicesPage } from '../invoices/invoices';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = StatsPage;
  tab2Root: any = ReadingsPage;
  tab3Root: any = InvoicesPage;
  tab4Root: any = SettingsPage;

  constructor() {

  }
}
