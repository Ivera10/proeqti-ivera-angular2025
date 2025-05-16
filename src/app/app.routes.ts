// import { Routes } from '@angular/router';
// import { HomePageComponent } from './component/home-page/home-page.component';
// import { ProductsComponent } from './products/products.component';
// import { CardPageComponent } from './card-page/card-page.component';



// export const routes: Routes = [
//   {
//     path: '',
//     component: HomePageComponent,
//   },

// ];




import { Routes } from '@angular/router';
import { BasketComponent } from './basket/basket.component';
import { ProductsComponent } from './products/products.component';
 
export const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'basket', component: BasketComponent },
  { path: '**', redirectTo: '' },
];