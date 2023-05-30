import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import * as CryptoJS from 'crypto-js';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  private encryptionKey!: any;
  private iv!: any;

  private ttsSubject = new Subject<number>();
  tts$ = this.ttsSubject.asObservable();
  constructor() { }

  public connect(): void {
    this.socket$ = webSocket('ws://localhost:3000');

    this.socket$.subscribe({
      next: (data) => {
        if (data.encryptionKey && data.iv) {
          this.encryptionKey = CryptoJS.enc.Hex.parse(data.encryptionKey);
          this.iv = CryptoJS.enc.Hex.parse(data.iv);
          // console.log(this.encryptionKey);
          // console.log(this.iv);
        } else {
          console.log('WebSocket connection opened');
        }
      },
      error: (error) => {
        // console.log("------------------------------")
        // console.log("------------------------------")

        console.error('WebSocket error:', error);

        this.disconnect();
        this.connect();
        // console.log("------------------------------")
          // console.log("------------------------------")

      },
      complete: () => {
        console.log('WebSocket connection closed');
      }
    });
  }


  public send(message: any): void {
    // console.log(this.socket$.closed);
    const startTime = performance.now();

    const encryptedMessage = CryptoJS.AES.encrypt(JSON.stringify(message), this.encryptionKey, {
      iv: this.iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    }).toString();
    this.socket$.next(encryptedMessage);
    const endTime = performance.now();
    const tts = endTime - startTime;  // tts: time to send data to server
    this.ttsSubject.next(tts);
    //console.log(`Tts: ${tts}ms`);
  }

  public onMessage(): any {
    return this.socket$.asObservable().pipe(map((message: any) => {
      if (!message.iv) {
        const decryptedMessageBytes = CryptoJS.AES.decrypt(
          CryptoJS.enc.Base64.stringify(message),
          this.encryptionKey,
          {
            iv: this.iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
          }
        );
        return JSON.parse(decryptedMessageBytes.toString(CryptoJS.enc.Utf8));

      }


    }));
  }

  public disconnect(): void {
    this.socket$.complete();
  }
}
