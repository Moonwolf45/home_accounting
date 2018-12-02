import { Component, Input, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { mergeMap } from 'rxjs/operators';

import { Category } from '../../shared/models/category.model';
import { ALCEvent } from '../../shared/models/event.model';
import { EventsService } from '../../shared/services/events.service';
import { BillService } from '../../shared/services/bill.service';
import { Bill } from '../../shared/models/bill.model';
import { Message } from '../../../shared/models/message.model';
import { Subscription } from 'rxjs';


@Component({
    selector: 'alc-add-event',
    templateUrl: './add-event.component.html',
    styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnDestroy {

    sub1: Subscription;
    sub2: Subscription;
    @Input() categories: Category[] = [];
    types = [
        {type: 'income', label: 'Доход'},
        {type: 'outcome', label: 'Расход'}
    ];
    message: Message;

    user_id: number = JSON.parse(window.localStorage.getItem('user')).id;

    constructor(private eventsService: EventsService, private billService: BillService) {
    }

    private showMessage(message: Message) {
        this.message = message;
        window.setTimeout(() => {
            this.message.text = '';
        }, 3500);
    }

    onSubmit(form: NgForm) {
        console.log(form);
        let {amount} = form.value;
        if (amount < 0) {
            amount *= -1;
        }

        const event = new ALCEvent(form.value.type, amount, +form.value.category, moment().format('DD.MM.YYYY HH:mm:ss'), form.value.description);

        this.sub1 = this.billService.getBill(this.user_id).subscribe((bill: Bill) => {
            let value = 0;
            if (form.value.type === 'outcome') {
                if (amount > bill.value) {
                    this.showMessage({
                        type: 'danger',
                        text: `На счету недостаточно средств. Вам нехватает ${amount - bill.value}`
                    });
                    return;
                } else {
                    value = bill.value - amount;
                }
            } else {
                value = bill.value + amount;
            }

            this.sub2 = this.billService.updateBill({value, currency: bill.currency, user_id: bill.user_id}).pipe(mergeMap(() => this.eventsService.addEvent(event)))
                .subscribe(() => {
                    form.setValue({
                        amount: 1,
                        description: ' ',
                        category: 1,
                        type: 'outcome'
                    });
                    this.showMessage({
                        type: 'success',
                        text: 'Событие успешно добавлено'
                    });
                });
        });
    }

    ngOnDestroy() {
        if (this.sub1) {
            this.sub1.unsubscribe();
        }
        if (this.sub2) {
            this.sub2.unsubscribe();
        }
    }
}
