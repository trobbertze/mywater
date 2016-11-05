import _ from 'lodash'

export class ValidationService {
    static emailValidator(control) {
        // RFC 2822 compliant regex
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null
        } else {
            return { 'invalidEmailAddress': true }
        }
    }

    static isEqual(group) {
      let valid = true
      let valueArray = []

      group.controls.some((control) => {
        if (valueArray.length !== 0) {
          if (_.last(valueArray) != control.value) {
            valid = false
            return true
          }
        }
        valueArray.push(control.value)
      })
      if (valid) {
        return null;
      }
      return {
        isEqual: true
      };
    }
}
