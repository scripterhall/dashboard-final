import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as JSZip from "jszip";
import { ToastrService } from "ngx-toastr";
import { Dossier } from "src/app/model/dossier";
import { Membre } from "src/app/model/membre";
import { AntiVerusService } from "src/app/service/anti-verus.service";
import { DossierService } from "src/app/service/dossier.service";
import { WebSocketDossierService } from "src/app/service/web-socket-dossier.service";
import Swal from "sweetalert2";


@Component({
  selector: "app-tables",
  templateUrl: "tables.component.html",
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent implements OnInit {
 
  zip:JSZip=new JSZip();
  formData:FormData = new FormData();
  folderName:string;
  verus:boolean=true
  projetDos:Dossier[]=[];
  constructor(
    private toastr: ToastrService,
    private dossierService:DossierService,
    private antiVerusService:AntiVerusService,
    private router: Router,
    private webSocketService:WebSocketDossierService
  ) {
    this.webSocketService.messageHandlingAddDos(null).subscribe(
      message => {
        if(message.subscribe && message.subscribe.projetId == JSON.parse(localStorage.getItem('projet')).id )
         this.projetDos.push(message.subscribe)
      }
    )
    this.webSocketService.messageHandlingSupprimerDos(null).subscribe(
      message => {
        console.log(message);
        if(message.supprimer && this.projetDos.find(dos => dos.id == message.supprimer.id) && message.supprimer.projetId == JSON.parse(localStorage.getItem('projet')).id )
         this.projetDos.splice(this.projetDos.indexOf(this.projetDos.find(dos => dos.id == message.supprimer.id)),1) 
      }
    )
    
  }
  membre:Membre
  ngOnInit() {
    if(localStorage.getItem("membre"))
      this.membre = JSON.parse(localStorage.getItem("membre"))
    this.folderName = ""
    const projet = JSON.parse(localStorage.getItem('projet'))
    this.dossierService.recupererDossierDeProjet(projet.id).subscribe(
      data => {
        if(data)
         this.projetDos = data
        console.log(data);
        
      },
      error =>{
        
      }
    )
  }

  dos:Dossier
  onFileChange(event){
    const files = event.target.files;
    this.folderName = files[0].webkitRelativePath.split('/')[0];
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
      totalSize += files[i].size;
    }

    if (totalSize >  30000000) {
      console.log("error");
      this.toastr.error("ce fichier contient plus que 300MB")
      event.target.value = '';
    }else{
      const folderNameDiv = document.getElementById("folderName");
      const folderDiv = document.getElementById("folder");
  
      folderDiv.classList.add("has-files")
      folderNameDiv.innerHTML = "nom de dossier : "+this.folderName
      for(let file of files){
        const path = file.webkitRelativePath.split(`${this.folderName}/`)[1];
        this.zip.file(path,file)
      }
      this.antiVerusService.checkVerus(this.zip).then(
        response => {
          this.antiVerusService.getReport().subscribe(
            resultat => {
              if (resultat.data.attributes.stats.malicious > 0) {
                this.toastr.error("Virus détecté !! \nAttention a ce que vous emettez dans l'application");
                this.reloadPage()
              } else {
                this.toastr.success("Dossier sain.");
                this.verus = false;
              }
            }
          );
        }
      );
    }
  }
  reloadPage() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.router.url]);
    });
  }

  uploadDos(){
    this.zip.generateAsync({type:'blob'}).then( content =>{
      const formData = new FormData();
      formData.append("compressedFile",content,`${this.folderName}.zip`)
      /** appel au service Dossier */
      const dossier:Dossier = {
        projetId:JSON.parse(localStorage.getItem('projet')).id,
        membreId:JSON.parse(localStorage.getItem('membre')).id,
        donnees:formData,
        nomDossier:this.folderName,
      }
      this.dossierService.sauvegarderDossier(dossier).subscribe(
        data => {
          if(data)
           this.webSocketService.messageHandlingAddDos(data).subscribe(
            (message) => {
              // afficher le message reçu dans la console
              console.log(message);
             
            },
            (err) => {
              console.error(err); // afficher les erreurs dans la console
            },
            () => {
              console.log('WebSocket connection closed'); // afficher un message lorsque la connexion est fermée
            }
           )
        },
        error => {
          this.toastr.error("vous avez déjà inserer ce dossier")
        }
      )
      
      /** end */
   })
  }


  supprimerDossier(dossier:Dossier){
    Swal.fire({
      title: "Clé correct, vous êtes sûr de supprimer le dossier : "+dossier.nomDossier,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, Lancer!',
      cancelButtonText: 'Annuler',
      background:'rgba(0,0,0,0.9)',
      backdrop: 'rgba(0,0,0,0.4)',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      focusConfirm: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.dossierService.supprimerDos(dossier.id).subscribe(
          data => {
            //this.projetDos.splice(this.projetDos.indexOf(this.projetDos.find(dos => dos.id == dossier.id)),1) 
            this.webSocketService.messageHandlingSupprimerDos(dossier).subscribe(
              message => {
                console.log(message);
              }
            )
          },
          error => {
            Swal.fire(
              'Erreur',
              'suppression impossible ',
              'error'
            )
          }
        )
      }
    })
   
  }

 
}
