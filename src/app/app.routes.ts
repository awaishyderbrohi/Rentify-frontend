import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component'
import { HowItWorksComponent } from './pages/how-it-works/how-it-works.component';
import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuardService } from './services/auth/auth-guard.service';
import { ProfileComponent } from './pages/profile/profile.component';
import { ForgetComponent } from './pages/forget/forget.component';
import { ProductListingFormComponent } from './pages/list-equipment/list-equipment.component';
import { ProductPageComponent } from './pages/product/product.component';
import { SearchResultsComponent } from './pages/search-result/search-result.component';


export const routes: Routes = [
  { path:'login', component:LoginComponent,},

  { path:'register', component:RegisterComponent},
  { path:'forgot-password', component:ForgetComponent},
  { path:'', component:HomeComponent},
  { path:'how-it-works', component:HowItWorksComponent},
  { path:'list-equipment',
     canActivate: [AuthGuardService],
     loadComponent:()=> import('./pages/list-equipment/list-equipment.component')
     .then(m=> m.ProductListingFormComponent)
    },
  {
    path:'user/profile',
    canActivate:[AuthGuardService],
    component:ProfileComponent
  },
   {path:"search",component:SearchResultsComponent},
  { path:'products/:id',component:ProductPageComponent},
  { path:'**', component:PageNotFoundComponent},

];
