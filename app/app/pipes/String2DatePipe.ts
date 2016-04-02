/**
 * String2DatePipe
 *
 * @author tobiasb
 * @since 2016
 */
import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({name: 'string2Date'})
export class String2DatePipe implements PipeTransform {
  transform(value: string) : string {
    var date = new Date(value);
    var str = ('00'+date.getDate()).slice(-2);
    str+="."+('00'+(date.getMonth()+1)).slice(-2);
    // str+="."+date.getFullYear();
    return str;
  }
}
