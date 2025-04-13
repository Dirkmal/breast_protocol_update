import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export class DynamicControl {
    value: any;
	unit?: string;	
	name: string;
	label?: string;
	required?: boolean;
	order?: number;
	controlType: ControlTypes;
	placeholder?: string;
	type?: InputTypes;
	toggles_group?: boolean;
	options?: string[];	
	validators?: {}[];
	errors?: {};
	disabled?: boolean;
	
	constructor(
		options: {
			value?: any;			
			name?: string;
			unit?: string;
			label?: string;
			required?: boolean;
			order?: number;
			controlType?: ControlTypes;
			placeholder?: string;
			type?: InputTypes;
			toggles_group?: boolean;
			options?: string [];
			validators?: {}[];
			errors?: {};
			disabled?: boolean;
		} = {}) {
		this.value = options.value;
		this.unit = options.unit || '';		
		this.name = options.name || '';
		this.label = options.label || this.name.replace(/_/g, ' ');
		this.required = options.required;
		this.order = options.order === undefined ? 1 : options.order;
		this.controlType = options.controlType || ControlTypes.INPUT;
		this.placeholder = options.placeholder || '';
		this.type = options.type || InputTypes.TEXT;
		this.toggles_group = options.toggles_group;
		this.options = options.options || [];
		this.validators = options.validators || [];
		this.errors = options.errors || {};
		this.disabled = options.disabled || false;
	}	
}

export enum InputTypes {
	NUMBER = 'number',
	TEXT = 'text',
	EMAIL = 'email',
	CHECKBOX = 'checkbox',
	RADIO = 'radio',
	PASSWORD = 'password',
	DATE = 'date'
}

export enum ControlTypes {
    SELECT = 'select',
    INPUT = 'input',
    DATE = 'date', //date must be specified because of Material's datepicker
    CHECKBOX = 'checkbox',
    TEXTAREA = 'textarea',
    RADIO = 'radio'
}