import {Injectable, EventEmitter} from "angular2/core";
import {Http, Headers} from "angular2/http";
import {UserData} from './UserData';
import 'rxjs/add/operator/map';

@Injectable()
export class ResultService {
  private  update: EventEmitter<boolean> = new EventEmitter();

  private playerColMapping : Object = {};
  private playerColorMapping: Object = {
    Carsten: '#3465A4',
    Daniel: '#4E9A06',
    Dennis: '#CC0000',
    Marc: '#630000',
    Frank: '#EDD400',
    Sebastian: '#75505B',
    Stefan: '#F57900',
    Steffen: '#204A87',
    Tobias: '#C17D11'
  };

  resultData : any = [];
  summaryData : Object[] = [{
    columns : [
      { footer : 'Summen:', colspan: 2 }
    ]
  }];
  playerCols: any = [];
  cache: Object = {};
  summaryCache: Object = {};
  moneyCache: Object = {};
  
  year: number;
  
  constructor(public http: Http, public userData: UserData) {
  }

  showYear(year, refresh:boolean = false) {
    this.year = year;
    if (!this.cache.hasOwnProperty(year) || refresh === true) {
      this.getAll(year);
    } else {
      this.resultData = this.cache[year];
      this.summaryCache[year].forEach((sum, index) => {
        let money = this.moneyCache[year][index];
        if (money) {
          money = " (" + money + " €)";
        }
        this.summaryData[0]['columns'][index+1] = { footer: sum + money };
      });
    }
  }

  getAll(year) {
      this.http.get(this.userData.baseUrl + 'results/' + year)
        .map(res => res.json()).subscribe(
        res => this.aggregateResults(year, res),
        err => console.log("Error: " + err)
      );
  }

  save(res) {
    if (!this.userData.authenticated) {
      return;
    }
    this.userData.getBasicAuth().then(auth => {
      if (auth) {
        let headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', auth);

        if (res.id) {
          // update appointment
          this.http.put(this.userData.baseUrl + 'results/', JSON.stringify(res), {headers: headers})
            .map(res => res.json()).subscribe(
            res => this.handleUpdate(res),
            err => console.log(err)
          );
        } else {
          // create new appointment
          this.http.post(this.userData.baseUrl + 'results/', JSON.stringify(res), {headers: headers})
            .map(res => res.json()).subscribe(
            res => this.handleUpdate(res),
            err => this.handleError(err, "Saving results")
          );
        }
      }
    })
  }

  delete(res) {
    if (!this.userData.isAdmin()) {
      return;
    }
    this.userData.getBasicAuth().then(auth => {
      if (res.id && auth) {
        let headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', auth);

        // delete appointment
        this.http.delete(this.userData.baseUrl + 'results/' + res.id, {headers: headers})
          .map(res => res.json()).subscribe(
          res => this.handleUpdate(res),
          err => console.log(err)
        );
      }
    });
  }

  handleError(err, msg) {
    console.log("ERROR: "+msg);
    console.log(err);
    switch (err.status) {
      case 401:
        console.log("401: Unauthorized");

        // // quick hack
        // let headers = new Headers();
        // headers.append('Content-Type', 'application/json');
        // this.http.post(this.baseUrl + 'users/',
        //   JSON.stringify({username: 'tobiasb', nick: 'Tobias', password: 'c0ck3r'}),
        //   { headers: headers }
        // ).map(res => res.json()).subscribe(
        //   res => console.log(res),
        //   err => console.error(err)
        // );
        break;
    }
  }

  handleUpdate(res) {
    var refreshYear = parseInt(res.refresh);
    if (refreshYear <= new Date().getFullYear() || refreshYear>=2006) {
      this.getAll(refreshYear);
    }
  }

  aggregateResults(year, results) {
    var data = {};
    this.summaryCache[year] = new Array(8);
    this.moneyCache[year] = new Array(8);
    results.forEach(res => {
      if (!data.hasOwnProperty(res.Appointment.id)) {
        data[res.Appointment.id] = {
          id: res.Appointment.id,
          date: res.Appointment.date,
          place: res.Appointment.place
        };
      }
      if (this.playerCols.indexOf(res.Player.nick) === -1) {
        this.playerCols.push(res.Player.nick);
        this.playerColMapping[res.Player.nick] = this.playerCols.length-1;
      }
      if (!this.summaryCache[year][this.playerColMapping[res.Player.nick]]) {
        this.summaryCache[year][this.playerColMapping[res.Player.nick]] = 0;
      }
      if (!this.moneyCache[year][this.playerColMapping[res.Player.nick]]) {
        this.moneyCache[year][this.playerColMapping[res.Player.nick]] = 0;
      }
      data[res.Appointment.id][res.Player.nick] = {
        points: res.points,
        isAvg: res.type
      };
      this.summaryCache[year][this.playerColMapping[res.Player.nick]] += res.points;
      this.moneyCache[year][this.playerColMapping[res.Player.nick]] += Math.max(10, Math.ceil(res.points/10));
    }, this);
    this.cache[year] = [];

    for (var key in data) {
      this.cache[year].push(data[key]);
    }

    this.showYear(year);
  }

  /**
   * Returns data for users/points to create charts
   */
  getUserPointsData() {
    let data = [];
    for (var i=0, l=this.summaryCache[this.year].length; i<l; i++) {
      var nick = this.getNickForColumn(i);
      data.push({
        value: this.summaryCache[this.year][i],
        label: nick,
        color: this.playerColorMapping[nick]
      });
    }
    return data;
  }

  getUserMoneyData() {
    let data = [];
    for (var i=0, l=this.moneyCache[this.year].length; i<l; i++) {
      var nick = this.getNickForColumn(i);
      data.push({
        value: this.moneyCache[this.year][i],
        label: nick,
        color: this.playerColorMapping[nick]
      });
    }
    return data;
  }

  getUserBarData() {
    let data = {
      labels: [],
      datasets: [{
        label: 'Punkte',
        fillColor: '#42A5F5',
        strokeColor: '#1E88E5',
        data: []
      }, {
        label: 'Einzahlungen',
        fillColor: '#9CCC65',
        strokeColor: '#7CB342',
        data: []
      }]
    };
    for (var i=0, l=this.summaryCache[this.year].length; i<l; i++) {
      var nick = this.getNickForColumn(i);
      data.labels[i] = nick;
      data.datasets[0].data[i] = this.summaryCache[this.year][i];
      data.datasets[1].data[i] = this.moneyCache[this.year][i];
    }
    return data;
  }
  
  getNickForColumn(col) {
    for (var nick in this.playerColMapping) {
      if (this.playerColMapping[nick] === col) {
        return nick;
      }
    }
  }

  emitUpdateEvent() {
    this.update.emit(true);
  }

  getUpdateEmitter() {
    return this.update;
  }
}
