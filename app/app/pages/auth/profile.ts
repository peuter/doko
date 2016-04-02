/**
 * profile
 *
 * @author tobiasb
 * @since 2016
 */

import {Page, NavController} from 'ionic-angular';
import {UserData} from '../../providers/UserData';
import {Results} from '../results/results';
import {FORM_DIRECTIVES} from 'angular2/common';

@Page({
  templateUrl: 'build/pages/auth/profile.html',
  directives: [FORM_DIRECTIVES]
})
export class ProfilePage {

  // When the page loads, we want the Login segment to be selected
  authType: string = "login";
  error: string;

  constructor(public userData: UserData, public nav: NavController) {
  }

  login(credentials) {
    this.userData.login(credentials.username, credentials.password);
    this.nav.setRoot(Results);
  }

  signup(credentials) {
    this.nav.setRoot(Results);
  }

  logout() {
    this.userData.logout();
    this.nav.setRoot(Results);
  }
}