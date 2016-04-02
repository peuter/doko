/**
 * UserData
 *
 * @author tobiasb
 * @since 2016
 */

import {Injectable} from 'angular2/core';
import {Storage, LocalStorage, Events} from 'ionic-angular';
import {ResultService} from './results.service';


@Injectable()
export class UserData {
  
  private storage : Storage;
  private events : Events;
  private resultService : ResultService;
  private HAS_LOGGED_IN : string = "hasLoggedIn";
  private maxYear : number = new Date().getFullYear();
  private minYear : number = 2006;

  year : number = new Date().getFullYear();
  
  static get parameters(){
    return [[Events]];
  }

  constructor(events: Events, resultService: ResultService) {
    this.storage = new Storage(LocalStorage);
    this.events = events;
    this.resultService = resultService;
  }

  setYear(year) {
    if (year >= this.minYear && year <= this.maxYear) {
      this.year = year;
    }
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
    this.storage.set(this.HAS_LOGGED_IN, true);
    this.events.publish('user:login');
  }

  signup(username, password) {
    this.storage.set(this.HAS_LOGGED_IN, true);
    this.events.publish('user:signup');
  }

  logout() {
    this.storage.remove(this.HAS_LOGGED_IN);
    this.events.publish('user:logout');
  }

  // return a promise
  hasLoggedIn() {
    return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
      return value;
    });
  }
}