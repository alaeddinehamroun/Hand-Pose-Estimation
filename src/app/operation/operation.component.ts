import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

declare var apiRTC: any;
@Component({
  selector: 'app-operation',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.css']
})
export class OperationComponent implements AfterViewInit {
  ngAfterViewInit() {
  }

  constructor() {
  }

  ngOnInit(): void {
      this.getOrcreateConversation;
  }



  getOrcreateConversation() {
    var localStream: any;

    //==============================
    // 1/ CREATE USER AGENT
    //==============================
    var ua = new apiRTC.UserAgent({
      uri: 'apzkey:myDemoApiKey'
    });

    //==============================
    // 2/ REGISTER
    //==============================
    ua.register().then((session: { getConversation: (arg0: any) => any; }) => {

      //==============================
      // 3/ CREATE CONVERSATION
      //==============================
      const conversation = session.getConversation("1234");

      //==========================================================
      // 4/ ADD EVENT LISTENER : WHEN NEW STREAM IS AVAILABLE IN CONVERSATION
      //==========================================================
      conversation.on('streamListChanged', (streamInfo: any) => {
        console.log("streamListChanged :", streamInfo);
        if (streamInfo.listEventType === 'added') {
          if (streamInfo.isRemote === true) {
            conversation.subscribeToMedia(streamInfo.streamId)
              .then((stream: any) => {
                console.log('subscribeToMedia success');
              }).catch((err: any) => {
                console.error('subscribeToMedia error', err);
              });
          }
        }
      });
      //=====================================================
      // 4 BIS/ ADD EVENT LISTENER : WHEN STREAM IS ADDED/REMOVED TO/FROM THE CONVERSATION
      //=====================================================
      conversation.on('streamAdded', (stream: any) => {
        stream.addInDiv('remote-container', 'remote-media-' + stream.streamId, {}, false);
      }).on('streamRemoved', (stream: any) => {
        stream.removeFromDiv('remote-container', 'remote-media-' + stream.streamId);
      });

      conversation.join()
            .then((response: any) => {
              //==============================
              // 7/ PUBLISH LOCAL STREAM
              //==============================
            }).catch((err: any) => {
              console.error('Conversation join error', err);
            });
    });
  }

}
