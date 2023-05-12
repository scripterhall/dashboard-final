import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WebSocketSubject, WebSocketSubjectConfig, webSocket } from "rxjs/webSocket";
import { WebSocketTicketTacheService } from "./service/web-socket-ticket-tache.service";

interface Message {
  name: string; message: string; type: string;
}

interface MessageCount {
  messagecount: number; type: string;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})



export class AppComponent implements OnInit {
  title = "gestion projet scrum";
  
  constructor(
    private webSocketService:WebSocketTicketTacheService
  ){}
  ws: WebSocketSubject<any>;
  message$: Observable<Message>;
 
  connected: boolean;
  ngOnInit() {
    this.webSocketService.connect().subscribe()
  }
  
}
