import {Page, NavController} from 'ionic-angular';
import {ResultService} from '../../providers/results.service';
import {UserData} from '../../providers/UserData';
import {DataTable, Column, Spinner} from 'primeng/primeng';
import {String2DatePipe} from '../../pipes/String2DatePipe';
import {NgFor} from 'angular2/common';
import {EditResult} from '../edit/editresult';


@Page({
  templateUrl: 'build/pages/results/results.html',
  directives: [DataTable, Column, NgFor, Spinner],
  pipes: [String2DatePipe]
})
export class Results {

  selectedEntry: any;
  
  constructor(public resultService: ResultService, public userData: UserData, public nav: NavController) {
  }

  gotToEditResult() {
    this.nav.push(EditResult);
  }

  handleRowSelect(event) {
    this.nav.push(EditResult, {
      item: event.data
    });
  }
}
