import 'es6-shim';
import {App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {TabsPage} from './pages/tabs/tabs';
import {UserData} from './providers/UserData';
import {ResultService} from './providers/results.service';

@App({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  providers: [UserData, ResultService],
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform, userData: UserData, resultService: ResultService) {
    // initialize data
    resultService.getAll(userData.getYear());

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (typeof StatusBar !== 'undefined') {
        StatusBar.styleDefault();
      }
    });
  }
}
