import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'readingNumberFormat'})
export class ReadingNumberFormatPipe implements PipeTransform {
  transform(value: any): any {
    if (!value) return value
    value = parseFloat(value)
    return value.toFixed(4).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }
}
