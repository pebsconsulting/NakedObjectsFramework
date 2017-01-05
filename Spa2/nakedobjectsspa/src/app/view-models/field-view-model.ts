﻿import { MessageViewModel } from './message-view-model';
import { ColorService } from '../color.service';
import { ErrorService } from '../error.service';
import { ILocalFilter } from '../mask.service';
import { ChoiceViewModel } from './choice-view-model';
import { IDraggableViewModel } from './idraggable-view-model';
import { AbstractControl } from '@angular/forms';
import * as Models from '../models';
import * as Ro from '../ro-interfaces';
import * as Config from '../config';
import * as Msg from '../user-messages';
import * as _ from "lodash";
import * as Helpers from './helpers-view-models';
import {ContextService} from '../context.service';

export abstract class FieldViewModel extends MessageViewModel {

    protected constructor(
        ext: Models.Extensions,
        protected colorService: ColorService,
        protected error: ErrorService,
        protected context : ContextService,
        public onPaneId: number,
        public isScalar: boolean,
        public id: string,
        public isCollectionContributed: boolean,
        public entryType : Models.EntryType
    ) {
        super();
        this.optional = ext.optional();
        this.description = ext.description();
        this.presentationHint = ext.presentationHint();
        this.mask = ext.mask();
        this.title = ext.friendlyName();
        this.returnType = ext.returnType();
        this.format = ext.format();
        this.multipleLines = ext.multipleLines() || 1;
        this.password = ext.dataType() === "password";
        this.type = isScalar ? "scalar" : "ref";
        this.argId = `${id.toLowerCase()}`;
        this.paneArgId = `${this.argId}${onPaneId}`;
        this.updateColor = _.partial(this.setColor, colorService);
    }

    argId: string;
    paneArgId: string;

    optional: boolean;
    description: string;
    presentationHint: string;
    mask: string;
    title: string;
    returnType: string;
    format: Ro.formatType;
    multipleLines: number;
    password: boolean;

    clientValid = true;
    readonly type: "scalar" | "ref";
    reference = "";
    minLength: number;

    color: string;

    promptArguments: _.Dictionary<Models.Value>;

    currentValue: Models.Value;
    originalValue: Models.Value;

    localFilter: ILocalFilter;
    formattedValue: string;
    private currentChoice: ChoiceViewModel;
    private currentMultipleChoices: ChoiceViewModel[];
    private currentRawValue: Ro.scalarValueType | Date = null;
    private choiceOptions: any[] = [];

    file: Models.Link;

    validate: (modelValue: any, viewValue: string, mandatoryOnly: boolean) => boolean;
    refresh: (newValue: Models.Value) => void;
    prompt: (searchTerm: string) => Promise<ChoiceViewModel[]>;
    conditionalChoices: (args: _.Dictionary<Models.Value>) => Promise<ChoiceViewModel[]>;
    drop: (newValue: IDraggableViewModel) => Promise<boolean>;
    private updateColor: () => void;

    get choices(): ChoiceViewModel[] {
        return this.choiceOptions;
    }

    set choices(options: ChoiceViewModel[]) {
        this.choiceOptions = options;

        if (this.entryType === Models.EntryType.MultipleConditionalChoices) {
            const currentSelectedOptions = this.selectedMultiChoices;
            this.selectedMultiChoices = _.filter(this.choiceOptions, c => _.some(currentSelectedOptions, (choiceToSet: any) => c.valuesEqual(choiceToSet)));
        } else if (this.entryType === Models.EntryType.ConditionalChoices) {
            const currentSelectedOption = this.selectedChoice;
            this.selectedChoice = _.find(this.choiceOptions, (c: any) => c.valuesEqual(currentSelectedOption));
        }
    }

    get selectedChoice(): ChoiceViewModel {
        return this.currentChoice;
    }

    set selectedChoice(newChoice: ChoiceViewModel) {
        // type guard because angular pushes string value here until directive finds 
        // choice
        if (newChoice instanceof ChoiceViewModel || newChoice == null) {
            this.currentChoice = newChoice;
            this.update();
        }
    }

    get value(): Ro.scalarValueType | Date {
        return this.currentRawValue;
    }

    set value(newValue: Ro.scalarValueType | Date) {
        this.currentRawValue = newValue;
        this.update();
    }

    get selectedMultiChoices(): ChoiceViewModel[] {
        return this.currentMultipleChoices;
    }

    set selectedMultiChoices(choices: ChoiceViewModel[]) {
        this.currentMultipleChoices = choices;
        this.update();
    }

  
    private isValid(viewValue: any): boolean {

        let val: string;

        if (viewValue instanceof ChoiceViewModel) {
            val = viewValue.getValue().toValueString();
        } else if (viewValue instanceof Array) {
            if (viewValue.length) {
                return _.every(viewValue as (string | ChoiceViewModel)[], (v: any) => this.isValid(v));
            }
            val = "";
        } else {
            val = viewValue as string;
        }

        if (this.entryType === Models.EntryType.AutoComplete && !(viewValue instanceof ChoiceViewModel)) {

            if (val) {
                this.setMessage(Msg.pendingAutoComplete);
                this.clientValid = false;
                return false;
            } else if (!this.optional) {
                this.resetMessage();
                this.clientValid = false;
                return false;
            }
        }

        // only fully validate freeform scalar 
        const fullValidate = this.entryType === Models.EntryType.FreeForm && this.type === "scalar";

        return this.validate(viewValue, val, !fullValidate);
    };

    readonly validator = (c: AbstractControl): { [index: string]: any; } => {
        const viewValue = c.value;
        const isvalid = this.isValid(viewValue);
        return isvalid ? null : { invalid: "invalid entry" };
    };
   
    readonly setNewValue = (newValue: IDraggableViewModel) => {
        this.selectedChoice = newValue.selectedChoice;
        this.value = newValue.value;
        this.reference = newValue.reference;
    }
 
    readonly clear = () => {
        this.selectedChoice = null;
        this.value = null;
        this.reference = "";
    }

    protected update() {
         this.updateColor();
    };

    protected setupChoices(choices: _.Dictionary<Models.Value>) {
        this.choices = _.map(choices, (v, n) => new ChoiceViewModel(v, this.id, n));
    }

    protected setupAutocomplete(rep: Models.IField, parentValues: () => _.Dictionary<Models.Value>, digest?: string) {

        this.prompt = (searchTerm: string) => {
            const createcvm = _.partial(Helpers.createChoiceViewModels, this.id, searchTerm);
            return this.context.autoComplete(rep, this.id, parentValues, searchTerm, digest).then(createcvm);
        };
        this.minLength = rep.promptLink().extensions().minLength();
        this.description = this.description || Msg.autoCompletePrompt;
    }

    protected setupConditionalChoices(rep: Models.IField, digest?: string) {

        this.conditionalChoices = (args: _.Dictionary<Models.Value>) => {
            const createcvm = _.partial(Helpers.createChoiceViewModels, this.id, null);
            return this.context.conditionalChoices(rep, this.id, () => <_.Dictionary<Models.Value>>{}, args, digest).then(createcvm);
        };
        this.promptArguments = (<any>_.fromPairs)(_.map(rep.promptLink().arguments(), (v: any, key: string) => [key, new Models.Value(v.value)]));
    }


    private setColor(color: ColorService) {

        if (this.entryType === Models.EntryType.AutoComplete && this.selectedChoice && this.type === "ref") {
            const href = this.selectedChoice.getValue().href();
            if (href) {
                color.toColorNumberFromHref(href)
                    .then(c => {
                        // only if we still have a choice may have been cleared by a later call
                        if (this.selectedChoice) {
                            this.color = `${Config.linkColor}${c}`;
                        }
                    })
                    .catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));
                return;
            }
        } else if (this.entryType !== Models.EntryType.AutoComplete && this.value) {
            color.toColorNumberFromType(this.returnType)
                .then(c => {
                    // only if we still have a value may have been cleared by a later call
                    if (this.value) {
                        this.color = `${Config.linkColor}${c}`;
                    }
                })
                .catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));
            return;
        }

        this.color = "";
    }

    readonly setValueFromControl = (newValue: Ro.scalarValueType | Date | ChoiceViewModel | ChoiceViewModel[]) => {

        if (newValue instanceof Array) {
            this.selectedMultiChoices = newValue;
        } else if (newValue instanceof ChoiceViewModel) {
            this.selectedChoice = newValue;
        } else {
            this.value = newValue;
        }
    }

    readonly getValueForControl = () => this.selectedMultiChoices || this.selectedChoice || this.value;

    readonly getValue = () => {

        if (this.entryType === Models.EntryType.File) {
            return new Models.Value(this.file);
        }

        if (this.entryType !== Models.EntryType.FreeForm || this.isCollectionContributed) {

            if (this.entryType === Models.EntryType.MultipleChoices || this.entryType === Models.EntryType.MultipleConditionalChoices || this.isCollectionContributed) {
                const selections = this.selectedMultiChoices || [];
                if (this.type === "scalar") {
                    const selValues = _.map(selections, cvm => cvm.getValue().scalar());
                    return new Models.Value(selValues);
                }
                const selRefs = _.map(selections, cvm => ({ href: cvm.getValue().href(), title: cvm.name })); // reference 
                return new Models.Value(selRefs);
            }

            const choiceValue = this.selectedChoice ? this.selectedChoice.getValue() : null;
            if (this.type === "scalar") {
                return new Models.Value(choiceValue && choiceValue.scalar() != null ? choiceValue.scalar() : "");
            }

            // reference 
            return new Models.Value(choiceValue && choiceValue.isReference() ? { href: choiceValue.href(), title: this.selectedChoice.name } : null);
        }

        if (this.type === "scalar") {
            if (this.value == null) {
                return new Models.Value("");
            }

            if (this.value instanceof Date) {

                if (this.format === "time") {
                    // time format
                    return new Models.Value(Models.toTimeString(this.value as Date));
                }

                if (this.format === "date") {
                    // truncate time;
                    return new Models.Value(Models.toDateString(this.value as Date));
                }
                // date-time
                return new Models.Value((this.value as Date).toISOString());
            }

            return new Models.Value(this.value as Ro.scalarValueType);
        }

        // reference
        return new Models.Value(this.reference ? { href: this.reference, title: this.value.toString() } : null);
    }
}