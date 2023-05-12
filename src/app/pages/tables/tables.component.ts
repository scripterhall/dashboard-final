import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as JSZip from "jszip";
import { ToastrService } from "ngx-toastr";
import { Dossier } from "src/app/model/dossier";
import { AntiVerusService } from "src/app/service/anti-verus.service";
import { DossierService } from "src/app/service/dossier.service";


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
  ) {}

  ngOnInit() {
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
           this.projetDos.push(data)
        },
        error => {
          this.toastr.error("vous avez déjà inserer ce dossier")
        }
      )
      
      /** end */
   })
  }

 
}
