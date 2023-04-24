import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import {MatBadgeModule} from '@angular/material/badge';
import { FooterComponent } from "./footer/footer.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [CommonModule, RouterModule, NgbModule, MatSelectModule,MatBadgeModule,MatButtonModule],
  declarations: [FooterComponent, NavbarComponent, SidebarComponent],
  exports: [FooterComponent, NavbarComponent, SidebarComponent]
})
export class ComponentsModule {}
