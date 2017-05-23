import { FieldViewModel } from '../view-models/field-view-model';
import { AfterViewInit, ViewChild } from '@angular/core';
import { Component, Input, EventEmitter } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import * as Helpers from '../view-models/helpers-view-models';
import * as moment from 'moment';
import { DateModel, DatePickerComponent, DatePickerOptions } from "../date-picker/date-picker.component";
import { ConfigService} from '../config.service';
import * as Constants from '../constants';

@Component({
    selector: 'nof-date-picker-facade',
    template: require('./date-picker-facade.component.html'),
    styles: [require('./date-picker-facade.component.css')]
})
export class DatePickerFacadeComponent implements AfterViewInit {

    constructor(private readonly configService : ConfigService) { 
        this.inputEvents = new EventEmitter<{ type: string, data: string | Date }>();
        this.datePickerOptions.format = configService.config.dateInputFormat;
    }

    @Input()
    control: AbstractControl;

    @Input()
    form: FormGroup;

    @Input()
    model: FieldViewModel;

    get id() {
        return this.model.paneArgId;
    }

    handleDefaultEvent(data: string) {
        if (this.control) {
            if (data === "closed") {
                const dateModel = this.datepicker.date as DateModel;
                const val = dateModel.momentObj ? dateModel.momentObj.format(Constants.fixedDateFormat) : "";            
                this.control.setValue(val);                      
            }
        }
    }

    handleDateChangedEvent(data: DateModel) {
        if (this.control) {
            this.model.resetMessage();
            this.model.clientValid = true;
            const date = data.momentObj ? data.momentObj.toDate() : "";
            this.control.setValue(date);      
        }
    }

   handleInvalidDateEvent(data: string) {
        if (this.control) {
           this.model.setMessage("Invalid date");
           this.model.clientValid = false;
           this.control.setErrors({"Invalid date": true});
        }
    }

    handleEvents(e: { data: DateModel | string, type: string }) {
        switch (e.type) {
            case ("default"):
                this.handleDefaultEvent(e.data as string);
                break;
            case ("dateChanged"):
                this.handleDateChangedEvent(e.data as DateModel);
                break;
             case ("dateInvalid"):
                this.handleInvalidDateEvent(e.data as string);
                break;
         
            default: //ignore
        }
    }

    inputEvents : EventEmitter<{data : string | Date, type : string}>;

    private getDateModel(date: moment.Moment) : DateModel {
        return new DateModel(date, this.datePickerOptions.format);     
    }

    ngAfterViewInit(): void {
        const existingValue = this.control.value;
        if (existingValue && (existingValue instanceof String || typeof existingValue === "string")) {
            const date = Helpers.getDate(existingValue as string);
            if (date) {
                setTimeout(() => this.inputEvents.emit({ data: date, type: "setDate" }));
            }
        }
    }

    datePickerOptions = new DatePickerOptions();

    @ViewChild("dp")
    datepicker : DatePickerComponent;
}
