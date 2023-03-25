// import { Injectable } from '@angular/core';
// import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

// @Injectable({
//   providedIn: 'root'
// })
// export class WebSocketService {
//   private socket$: WebSocketSubject<any>;

//   constructor() { }

//   public connect(): void {
//     this.socket$ = new WebSocketSubject('ws://localhost:8080');
//   }

//   public send(message: any): void {
//     this.socket$.next(message);
//   }

//   public onMessage(): any {
//     return this.socket$.asObservable();
//   }

//   public disconnect(): void {
//     this.socket$.complete();
//   }
// }
