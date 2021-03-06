import {Page} from 'ionic-angular';
import {Results} from '../results/results';
import {ProfilePage} from '../auth/profile';
import {ChartsPage} from '../charts/ChartsPage';

@Page({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  resultTab: any = Results;
  chartTab: any = ChartsPage;
  profileTab: any = ProfilePage;
}
