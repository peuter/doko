/**
 * ChartsPage
 *
 * @author tobiasb
 * @since 2016
 */

import {Page} from 'ionic-angular';
import {UserData} from '../../providers/UserData';
import {ResultService} from '../../providers/results.service';
import {PieChart, BarChart} from 'primeng/primeng';

@Page({
  templateUrl: 'build/pages/charts/charts.html',
  directives: [PieChart, BarChart]
})
export class ChartsPage {
  
  pointsData: any[];
  moneyData: any[];
  barData: Object;
  
  constructor(public userData: UserData, public resultService: ResultService) {
    this.updateData();
  }
  
  updateData() {
    this.pointsData = this.resultService.getUserPointsData();
    this.moneyData = this.resultService.getUserMoneyData();
    this.barData = this.resultService.getUserBarData();
  }
}