import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGuard } from 'src/app/guard/user.guard';
import { AdditemComponent } from './additem/additem.component';
import { ViewitemComponent } from './viewitem/viewitem.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/collection/mycollection',
    pathMatch: 'full',
  }, {
    path: 'add/:id',
    component: AdditemComponent,
    canActivate: [UserGuard]
  }, {
    path: 'edit/:id',
    component: AdditemComponent,
    canActivate: [UserGuard]
  }, {
    path: 'view/:id',
    component: ViewitemComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemsRoutingModule { }
