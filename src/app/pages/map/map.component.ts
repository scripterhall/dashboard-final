import { Component, Directive, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { interval, map, Observable, of, takeWhile } from "rxjs";
import { Membre } from "src/app/model/membre";
import { Projet } from "src/app/model/projet";
import { Role } from "src/app/model/role";
import { Sprint } from "src/app/model/sprint";
import { SprintBacklog } from "src/app/model/sprint-backlog";
import { TacheTicket } from "src/app/model/tache-ticket";
import { TicketHistoire } from "src/app/model/ticket-histoire";
import { HistoireTicketService } from "src/app/service/histoire-ticket.service";
import { MembreService } from "src/app/service/membre.service";
import { RoleService } from "src/app/service/role.service";
import { SprintBacklogService } from "src/app/service/sprint-backlog.service";
import { SprintService } from "src/app/service/sprint.service";
import { TicketTacheService } from "src/app/service/ticket-tache.service";
import { AjoutTacheSpbComponent } from "../dialogs/ajout-tache-spb/ajout-tache-spb.component";
import { GestionTacheDialogComponent } from "../dialogs/gestion-tache-dialog/gestion-tache-dialog.component";
import Swal from "sweetalert2";
import { WebSocketTicketTacheService } from "src/app/service/web-socket-ticket-tache.service";


export interface DialogDataTicketTache {
  sprintBacklog: SprintBacklog;
  ticketHistoire: TicketHistoire
}

export interface DialogGererDataTicketTache {
  ticketTache: TacheTicket
}



@Component({
  selector: "app-map",
  templateUrl: "map.component.html",
  styleUrls: ['./map.component.scss'],

})


export class MapComponent implements OnInit {
  constructor(
    private sprintService: SprintService,
    private ticketHistoireService: HistoireTicketService,
    private ticketTacheService: TicketTacheService,
    private sprintBacklogService: SprintBacklogService,
    private membreService: MembreService,
    private dialogAjout: MatDialog,
    private roleService: RoleService,
    private toastr: ToastrService,
    private dialogGestion: MatDialog,
    private webSocketService: WebSocketTicketTacheService
  ) {
    this.webSocketService.messageHandlingAdd(new TacheTicket()).subscribe(
      message => {
        console.log(message);
        if(this.webSocketService.ticketTache)
          this.taskMap.get(message.subscribe.ht).push(this.webSocketService.ticketTache)
        

        if (message.subscribe) {
          const ticketHistoire = message.subscribe.ht
          for (const key of this.taskMap.keys()) {
            if (key.id === ticketHistoire.id) {
              const listeTache = this.taskMap.get(key)
              const productBacklog = JSON.parse(localStorage.getItem('productBacklogCourant'))
              console.log(message.subscribe); // afficher le message reçu dans la console
              const ticketTache: TacheTicket = message.subscribe
              if (!listeTache.find(tache => tache.id == ticketTache.id) && ticketTache.ht.productBacklogId == productBacklog.id) {
                listeTache.push(ticketTache)
              }
            }
          }
        }
      }
    )
    this.webSocketService.messageHandlingSupprimer(new TacheTicket()).subscribe(
      message => {
        if (message.supprimer) {
          const ticketTache: TacheTicket = message.supprimer
          const ticketHistoire = message.supprimer.ht
          for (const key of this.taskMap.keys()) {
            if (key.id === ticketHistoire.id) {
              const listeTache = this.taskMap.get(key)
              if (listeTache.find(tache => tache.id == ticketTache.id)) {
                listeTache.splice(listeTache.indexOf(listeTache.find(tache => tache.id == ticketTache.id)), 1)
              }
            }
          }
        }
      }
    )
    this.webSocketService.messageHandlingModifier(new TacheTicket()).subscribe(
      message => {
        if (message.modifier) {
          for (const key of this.taskMap.keys()) {
            if (key.id === message.modifier.ht.id) {
              const listeTache = this.taskMap.get(key)
              const ticketTache:TacheTicket = message.modifier
              if(listeTache.find(tache => tache.id == ticketTache.id)){
                console.log(ticketTache.titre);
                listeTache[listeTache.indexOf(listeTache.find(tache => tache.id == ticketTache.id))]=ticketTache
              }
            }
          }
        }
      }
    )  

  }


  sprintsList: Sprint[]
  sprintBacklogs: SprintBacklog[] = []
  ticketsHistoireList: TicketHistoire[]
  ticketsTache: TacheTicket[] = []
  taskMap: Map<TicketHistoire, TacheTicket[]> = new Map<TicketHistoire, TacheTicket[]>()
  listMembre: Membre[] = []
  showCourbe = false;
  ticketTachePrise: TacheTicket[]
  endDate: Date = new Date('2023-03-31T23:59:59');
  roles: Role[];


  ngOnInit() {
    const projet: Projet = JSON.parse(localStorage.getItem('projet'))
    this.roleService.afficherListRoleParProjet(projet.id).subscribe(
      data => {
        console.log(data);
        this.roles = data
        for (let role of data) {
          this.listMembre.push(role.membre)
        }
      }
    )


    const productBacklog = JSON.parse(localStorage.getItem('productBacklogCourant'))
    this.sprintService.getListSprintsByProductBacklog(productBacklog.id).subscribe(
      listSprintData => {

        listSprintData = listSprintData.filter(sprint => sprint.etat != "en attente")
        this.sprintsList = listSprintData
        for (let i = 0; i < listSprintData.length; i++)
          this.sprintBacklogService.afficherSprintBacklogBySprintId(listSprintData[i].id).subscribe(
            sprintBacklogData => {

              this.sprintBacklogs.push(sprintBacklogData);

            }
          )

      }
    );
  }

  afficherDetailSprintBacklog(sprintBacklog: SprintBacklog) {
    console.log(sprintBacklog.sprint.id);
    const taskMap = new Map();
    this.ticketHistoireService.getHistoireTicketBySprintId(sprintBacklog.sprint.id).subscribe(
      data => {
        this.ticketsHistoireList = data;
        for (let ht of this.ticketsHistoireList) {

          this.ticketTacheService.getListTicketTacheParHt(ht.id).subscribe(
            listTacheData => {
              this.ticketsTache = listTacheData;
              taskMap.set(ht, this.ticketsTache)
              console.log(this.ticketsTache);


            }
          )

        }
        this.taskMap = taskMap
      }
    )

  }

  //choix couleur tache
  getBackgroundColor(index: number): any {
    if (index % 2 === 0) {
      return { 'background-color': '#C8F8F3' };
    } else if (index % 3 == 0 && index % 2 == 0) {
      return { 'background-color': '#F0FCCA' };
    } else if (index % 3 == 0) {
      return { 'background-color': '#EFF8C2' };
    } else if (index % 7 == 0) {
      return { 'background-color': '#F8E7C2' };
    } else if (index == 1) {
      return { 'background-color': '#DDDAD3' };
    } else {
      return {};
    }
  }


  prendreTicket(idTicketTache: number,ht:TicketHistoire) {
    const ticket = this.taskMap.get(ht).find(tache => tache.id == idTicketTache)
    Swal.fire({
      title: "vous êtes sûr de prendre la tâche : " + ticket?.titre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, Lancer!',
      cancelButtonText: 'Annuler',
      background: 'rgba(0,0,0,0.9)',
      backdrop: 'rgba(0,0,0,0.4)',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      focusConfirm: false
    }).then((result) => {
      if (result.isConfirmed) {
        const membre = JSON.parse(localStorage.getItem('membre'))
        this.ticketTacheService.affecterTicketAMembre(membre, idTicketTache).subscribe(
          dataTicket => {
          
                ticket.dateFin = dataTicket.dateFin
                ticket.dateLancement = dataTicket.dateLancement
                ticket.membre = dataTicket.membre
                ticket.membreId = dataTicket.membreId
                Swal.fire(
                  'tâche pris',
                  'Vous êtes le responsable de cette tâche vieulliez à ce quelle soit terminé dans ' + ticket.nbHeurs + "H",
                  'success'
                )
                this.webSocketService.messageHandlingModifier(ticket).subscribe(
                  (message) => {
                    console.log(message.modifier); // afficher le message reçu dans la console
                    
                  },
                  (err) => {
                    console.error(err); // afficher les erreurs dans la console
                  },
                  () => {
                    console.log('WebSocket connection closed'); // afficher un message lorsque la connexion est fermée
                  }
                );
              
            
          }
        )

      }
    }
    );


  }

  reverseIndex(index: number, length: number): number {
    return length - index;
  }

  activeIndex = -1;

  toggleAccordion(index: number) {
    if (index === this.activeIndex) {
      this.sprintBacklogs[index].isOpen = false;
      this.activeIndex = -1;
    } else {
      this.sprintBacklogs.forEach((item, i) => {
        item.isOpen = i === index ? true : false;
      });
      this.activeIndex = index;
    }
  }


  openAjoutDialog(ht: TicketHistoire, sprintBacklog: SprintBacklog) {
    const dialogRef = this.dialogAjout.open(AjoutTacheSpbComponent, {
      width: '350px',
      height: '550px',
      data: {
        sprintBacklog: sprintBacklog,
        ticketHistoire: ht
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const ticketHistoire = result.ht
        for (const key of this.taskMap.keys()) {
          if (key.id === ticketHistoire.id) {
            const listeTache = this.taskMap.get(key)
            listeTache.push(result)
            this.webSocketService.messageHandlingAdd(result).subscribe(
              (message) => {
                
              },
              (err) => {
                console.error(err); // afficher les erreurs dans la console
              },
              () => {
                console.log('WebSocket connection closed'); // afficher un message lorsque la connexion est fermée
              }
            );

            console.log(result);
            result.ht.sprintId = result.sprintBacklog.sprintId
            result.ht.status = "EN_COURS"
            this.ticketHistoireService.updateUserStory(result.ht.id, result.ht).subscribe(
              dataHistoire => {
                console.log(dataHistoire)
                key.status = "EN_COURS"
              }
            )
          }
        }
      }
    });
  }


  openGestionTache(tt: TacheTicket) {

    const dialogRef = this.dialogGestion.open(GestionTacheDialogComponent, {
      width: '650px',
      height: '300px',
      data: {
        ticketTache: tt
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
          if (result.mode == 'modifier') {
                this.webSocketService.messageHandlingModifier(result.tt).subscribe(
                  (message) => {
                    console.log(message.modifier); // afficher le message reçu dans la console
                  },
                  (err) => {
                    console.error(err); // afficher les erreurs dans la console
                  },
                  () => {
                    console.log('WebSocket connection closed'); // afficher un message lorsque la connexion est fermée
                  }
                );
  
             
          }
          else if (result.mode == 'supprimer') {
            const ticketHistoire = result.tt.ht
            for (const key of this.taskMap.keys()) {
              if (key.id === ticketHistoire.id) {
                const listeTache = this.taskMap.get(key)
                this.webSocketService.messageHandlingSupprimer(result.tt).subscribe(
                  (message) => {
                    console.log(message.supprimer); // afficher le message reçu dans la console
                  },
                  (err) => {
                    console.error(err); // afficher les erreurs dans la console
                  },
                  () => {
                    console.log('WebSocket connection closed'); // afficher un message lorsque la connexion est fermée
                  }
                );
              }
            }
          } else if (result.mode == 'terminer') {
            const ticketHistoire = result.tt.ht
            for (const key of this.taskMap.keys()) {
              if (key.id === ticketHistoire.id) {
                const listeTache = this.taskMap.get(key)
                const listeTacheTermine = listeTache.filter(tache => tache.etat == "terminé")
                if (listeTacheTermine.length == listeTache.length) {
                  ticketHistoire.status = "TERMINE"
                  console.log(ticketHistoire);
                  this.ticketHistoireService.updateUserStory(ticketHistoire.id, ticketHistoire).subscribe(
                    dataHistoire => {
                      console.log(dataHistoire)
                      if (!this.verifSprintBacklogTerminer())
                        Swal.fire(
                          'Félicitation ',
                          'vous avez terminer un histoire de sprint',
                          'success'
                        )
                      else
                        Swal.fire(
                          'Félicitation ',
                          'vous avez terminer le sprint ,\n avez vous respecter le time Box',
                          'success'
                        )

                    }
                  )
                }

              }

            }
          }
       
    });
  }


  checkRole(membre: Membre) {
    const role = this.roles.find(role => role.membre.id === membre.id);
    return role.status == "ACCEPTE"
  }


  verifierPersPris(membre: Membre) {
    const prendre = "cette ticket est pris par "
    if (JSON.parse(localStorage.getItem('membre')).id == membre.id)
      this.toastr.success(`${prendre} Vous 	😀`);
    else
      this.toastr.success(`${prendre} ${membre.email}`);
  }


  verifSprintBacklogTerminer() {
    for (let key of this.taskMap.keys()) {
      if (key.status == "EN_COURS")
        return false
    }
    return true
  }


  detacherMembreDeTache(tache: TacheTicket) {
    if (tache.etat != "terminé") {
      console.log(tache);
      Swal.fire({
        title: "vous êtes sûr de vous détacher de cette tâche ?",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui !',
        cancelButtonText: 'Annuler',
        backdrop: 'rgba(0,0,0,0.4)',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        focusConfirm: false
      }).then((result) => {
        if (result.isConfirmed) {
          
          tache.dateFin = null
          tache.dateLancement = null
          tache.membreId = null
          tache.membre = null
          this.ticketTacheService.modifierTicketTache(tache).subscribe(
            data => {
              tache = data
              this.webSocketService.messageHandlingModifier(data).subscribe(
                (message) => {
                  console.log(message.modifier); // afficher le message reçu dans la console
                  
                },
                (err) => {
                  console.error(err); // afficher les erreurs dans la console
                },
                () => {
                  console.log('WebSocket connection closed'); // afficher un message lorsque la connexion est fermée
                }
              );
            }
          )
        }
      })

    } else {
      Swal.fire(
        'attentient',
        'cette tâche est terminé',
        'warning'
      )
    }
  }

}


