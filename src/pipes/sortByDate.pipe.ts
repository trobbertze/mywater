import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'sortByDate'})
export class SortByDatePipe implements PipeTransform {
  transform(arr: any[]): any[]{
    if (arr) {
      return arr.sort((a, b) => b.timestamp - a.timestamp)
    }
    return arr
  }
}
