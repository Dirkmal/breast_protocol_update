import { Injectable } from '@angular/core';
import { DynamicControl } from '../../models/dynamic-control';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormControlService {
  toFormControl(controls: DynamicControl[]): any {
		const group: any = {};

		controls.forEach(control => {
			let ctrl = new FormControl(control.value || '');
			let validators = [];
			
			if (control.required) {
				validators.push(Validators.required);
			}

			if (control.validators) {
				control.validators.forEach(validator => {
					validators.push(validator);
				});
			}
			ctrl.setValidators(validators);

			group[control.name] = ctrl;
		});

		return group;
	}

	toFormGroup(controls: DynamicControl[]) {
		const group = this.toFormControl(controls);
		return new FormGroup(group);
	}

	toFormArray(controls: DynamicControl[]) {
		const group = this.toFormControl(controls);
		return new FormArray(group);
	}
}
