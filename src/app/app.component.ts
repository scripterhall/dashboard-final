import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { WebSocketSubject } from "rxjs/webSocket";
import { WebSocketTicketTacheService } from "./service/web-socket-ticket-tache.service";
import { WebSocketDossierService } from "./service/web-socket-dossier.service";
import { WebSocketInvitationService } from "./service/web-socket-invitation.service";

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
    private webSocketService:WebSocketTicketTacheService,
    private webSocketDossierService:WebSocketDossierService,
    private webSocketInvitationService:WebSocketInvitationService
  ){

  }
  ws: WebSocketSubject<any>;
  message$: Observable<Message>;
 
  connected: boolean;
  ngOnInit() {
    this.webSocketService.connect().subscribe()
    this.webSocketDossierService.connect().subscribe()
    this.webSocketInvitationService.connect().subscribe()
  }
  
}
