// // chat-websocket.service.ts
// import { Injectable } from '@angular/core';
// import * as Stomp from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import { Subject } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class ChatWebSocketService {
//   private stompClient: Stomp.Client | null = null;
//   private messageSubject = new Subject<any>();

//   connect() {
//     const socket = new SockJS('http://localhost:8080/chat'); // backend endpoint
//     this.stompClient = new Stomp.Client({
//       webSocketFactory: () => socket as WebSocket,
//       reconnectDelay: 5000
//     });

//     this.stompClient.onConnect = () => {
//       console.log('Connected to WebSocket');
//     };

//     this.stompClient.activate();
//   }

//   subscribeToConversation(conversationId: string) {
//     if (!this.stompClient) return;

//     this.stompClient.subscribe(`/topic/conversation/${conversationId}`, (msg) => {
//       this.messageSubject.next(JSON.parse(msg.body));
//     });
//   }

//   sendMessage(destination: string, body: any) {
//     if (this.stompClient && this.stompClient.connected) {
//       this.stompClient.publish({
//         destination,
//         body: JSON.stringify(body)
//       });
//     }
//   }

//   getMessages() {
//     return this.messageSubject.asObservable();
//   }
// }
