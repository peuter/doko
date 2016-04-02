/**
 * result.ts
 *
 * @author tobiasb
 * @since 2016
 */
import {Page, NavController, NavParams} from 'ionic-angular';
import {ResultService} from '../../providers/results.service';
import {Results} from '../results/results';

@Page({
  templateUrl: 'build/pages/edit/result.html'
})
export class EditResult {
  public id: number;
  public date: string;
  public place: string;
  public players: Object[] = [];

  places: string[] = [];

  constructor(public resultService: ResultService, public nav: NavController, navParams: NavParams) {
    resultService.playerCols.forEach((player, index) => {
      this.places.push(player);
      this.players.push({nick: player, index: index});
    });
    var editItem = navParams.get('item')
    if (editItem) {
      this.id = editItem.id;
      this.date = this.getDateString(new Date(editItem.date));
      this.place = editItem.place;
      this.players.forEach(player => {
        if (editItem.hasOwnProperty(player['nick'])) {
          player['points'] = editItem[player['nick']];
        }
      })
    } else {
      // init current dte
      this.date = this.getDateString(new Date());
    }
  }

  getDateString(date) {
    return date.getFullYear()+"-"+('00'+(date.getMonth()+1)).slice(-2)+"-"+('00'+date.getDate()).slice(-2);
  }
  
  save() {
    this.resultService.save({
      date: this.date,
      place: this.place,
      players: this.players
    });
    this.nav.pop(EditResult);
  }
}