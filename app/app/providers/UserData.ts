/**
 * UserData
 *
 * @author tobiasb
 * @since 2016
 */

import {Injectable} from 'angular2/core';
import {Storage, LocalStorage, Events} from 'ionic-angular';
import {Http, Headers} from "angular2/http";
import 'rxjs/add/operator/map';

@Injectable()
export class UserData {
  private storage : Storage;
  
  private BASIC_AUTH : string;
  private USER_DATA: string = "userData";
  private user : Object;
  private maxYear : number = new Date().getFullYear();
  private minYear : number = 2006;

  year : number = new Date().getFullYear();

  authenticated : boolean = false;

  baseUrl : string = 'http://doko.tbraeutigam.de:3000/api/';

  constructor(public events: Events, public http: Http) {
    this.storage = new Storage(LocalStorage);
    this.storage.get(this.USER_DATA).then(value => {
      this.user = JSON.parse(value);
      this.authenticated = this.hasLoggedIn();
    });
  }

  setYear(year) {
    if (year >= this.minYear && year <= this.maxYear) {
      this.year = year;
    }
  }
  
  getBasicAuth() {
    return this.storage.get(this.BASIC_AUTH);
  }
  
  getUserData() {
    return this.user;
  }
  
  isAdmin() {
    return this.user && this.user['role'] === 'admin';
  }

  getYear() {
    return this.year;
  }

  getMinYear() {
    return this.minYear;
  }

  getMaxYear() {
    return this.maxYear;
  }

  login(username, password) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.baseUrl+"/users/login", JSON.stringify({username: username, password: password}), { headers: headers })
      .map(res => res.json())
      .subscribe(
        res => {
          if (res.login === true) {
            this.authenticated = true;
            this.storage.set(this.BASIC_AUTH, "Basic "+btoa(username+":"+password));
            this.storage.set(this.USER_DATA, JSON.stringify(res.user));
            this.user = res.user;
            this.events.publish('user:login');
          } else {
            console.log(res.error);
          }
        },
        err => {
          console.log(err);
          
        }
      );
  }

  logout() {
    this.storage.remove(this.BASIC_AUTH);
    this.storage.remove(this.USER_DATA);
    this.authenticated = false;
    this.user = null;
    this.events.publish('user:logout');
  }

  // return a promise
  hasLoggedIn() {
    return this.user && !!this.user['role'];
  }
}