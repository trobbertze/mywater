import { Pipe, PipeTransform } from '@angular/core';

declare let moment: any

@Pipe({name: 'momentCalendar'})
export class MomentCalendarPipe implements PipeTransform {
  transform(value: string): any {
    if (!value) return value;

    return moment(value).calendar(null, {
        sameDay: '[Today] hh:mm a',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'DD/MM/YYYY'
    });
  }
}
