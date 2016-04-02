import {Injectable, EventEmitter} from "angular2/core";
import {Http, Headers} from "angular2/http";
import {UserData} from './UserData';
import 'rxjs/add/operator/map';

@Injectable()
export class ResultService {
  private  update: EventEmitter<boolean> = new EventEmitter();

  private playerColMapping : Object = {};

  resultData : any = [];
  summaryData : Object[] = [{
    columns : [
      { footer : 'Summen:', colspan: 2 }
    ]
  }];
  playerCols: any = [];
  cache: Object = {};
  summaryCache: Object = {};
  
  constructor(public http: Http, public userData: UserData) {
  }

  showYear(year, refresh:boolean = false) {
    if (!this.cache.hasOwnProperty(year) || refresh === true) {
      this.getAll(year);
    } else {
      this.resultData = this.cache[year];
      this.summaryCache[year].forEach((sum, index) => {
        this.summaryData[0]['columns'][index+1] = { footer: sum };
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
      data[res.Appointment.id][res.Player.nick] = res.points;
      this.summaryCache[year][this.playerColMapping[res.Player.nick]] += res.points;
    }, this);
    this.cache[year] = [];

    for (var key in data) {
      this.cache[year].push(data[key]);
    }

    this.showYear(year);
  }

  emitUpdateEvent() {
    this.update.emit(true);
  }

  getUpdateEmitter() {
    return this.update;
  }
}
