import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataSharingService {
    private subject = new Subject<any>();

    sendData(data: any) {
        this.subject.next(data);
    }

    // clearData() {
    //     this.subject.next();
    // }

    getData(): Observable<any> {
        return this.subject.asObservable();
    }
}
