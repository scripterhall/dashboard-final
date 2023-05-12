import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { MapComponent } from "../../pages/map/map.component";
import { UserComponent } from "../../pages/user/user.component";
import { TablesComponent } from "../../pages/tables/tables.component";
import { TypographyComponent } from "../../pages/typography/typography.component";
import { ScrumBoardComponent } from "src/app/pages/scrum-board/scrum-board.component";
import { CourbesComponent } from "src/app/pages/courbes/courbes.component";
import { CorbeilleComponent } from "src/app/pages/corbeille/corbeille.component";
import { ModifierProfileComponent } from "src/app/pages/modifier-profile/modifier-profile.component";


export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "icons", component: IconsComponent },
  { path: "maps", component: MapComponent },
  { path: "scrumBoard", component: ScrumBoardComponent },
  { path: "user", component: ModifierProfileComponent },
  {path:"visioConference",component:UserComponent},
  { path: "tables", component: TablesComponent },
  { path: "typography", component: TypographyComponent },
  { path: "courbes", component: CourbesComponent },
  {path: "corbeille", component:CorbeilleComponent}
  // { path: "rtl", component: RtlComponent }
];
