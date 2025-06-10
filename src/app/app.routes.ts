// import { Routes } from '@angular/router';
// import { BasketComponent } from './basket/basket.component';
// import { ProductsComponent } from './products/products.component';
// import { CardPageComponent } from './card-page/card-page.component';
// import { LoginComponent } from './auth/login/login.component';
// import { RegisterComponent } from './auth/register/register.component';
// import { ProfileComponent } from './profile/profile.component';
// import { HomePageComponent } from './component/home-page/home-page.component';
// import { AuthGuard } from './services/auth.guard';

// export const routes: Routes = [
//   { path: '', redirectTo: 'home', pathMatch: 'full' }, // მთავარი გვერდი
//   { path: 'home', component: HomePageComponent },
//   { path: 'products', component: ProductsComponent },
//   { path: 'basket', component: BasketComponent },
//   { path: 'card-page-product/:id', component: CardPageComponent },
//   { path: 'card-page-product', redirectTo: 'home' },
//   { path: 'login', component: LoginComponent },
//   { path: 'register', component: RegisterComponent },
//   {
//     path: 'profile',
//     component: ProfileComponent,
//     canActivate: [AuthGuard],
//   },
//   { path: '**', redirectTo: 'home' }
// ];


import { Routes } from '@angular/router';
import { BasketComponent } from './basket/basket.component';
import { ProductsComponent } from './products/products.component';
import { CardPageComponent } from './card-page/card-page.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { HomePageComponent } from './component/home-page/home-page.component';
import { AuthGuard } from './guards/auth.guard';
// import { AuthGuard } from './services/auth.guard';
 
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // მთავარი გვერდი
  { path: 'home', component: HomePageComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'basket', component: BasketComponent },
  { path: 'card-page-product/:id', component: CardPageComponent },
  { path: 'card-page-product', redirectTo: 'home' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'home' }
];