import 'es6-shim';
import {App, Platform} from 'ionic-angular';
import {StatusBar, Push} from 'ionic-native';
import {TabsPage} from './pages/tabs/tabs';
import {UserData} from './providers/UserData';
import {ResultService} from './providers/results.service';
import {Growl, Message} from 'primeng/primeng';

@App({
  template: '<ion-nav [root]="rootPage"><p-growl [value]="msgs"></p-growl></ion-nav>',
  providers: [UserData, ResultService],
  directives: [Growl],
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
  rootPage: any = TabsPage;
  push: any;
  msg: Message[] = [];

  constructor(platform: Platform, userData: UserData, resultService: ResultService) {
    // initialize data
    resultService.getAll(userData.getYear());

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (typeof StatusBar !== 'undefined') {
        StatusBar.styleDefault();
      }
      this.push = Push.init({
        android: {
          senderID: "2799219296"
        }
      });

      this.push.on('registration', (data) => {
        console.log(data.registrationId);
        console.log(data);
      });

      this.push.on('notification', (data) => {
        this.msg.push({
          severity: 'info',
          summary: data.title,
          detail: data.message
        });
        console.log(data.message);
        console.log(data.title);
        console.log(data.count);
        console.log(data.sound);
        console.log(data.image);
        console.log(data.additionalData);
      });

      this.push.on('error', (e) => {
        this.msg.push({
          severity: 'error',
          summary: 'Error',
          detail: e.message
        });
        console.log(e.message);
      });
    });
  }
}
