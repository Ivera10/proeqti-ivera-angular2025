
import { Routes } from '@angular/router';
import { ThirdPageComponent } from './component/third-page/third-page.component';
import { SecondPageComponent } from './component/second-page/second-page.component'; 
import { HomePageComponent } from './component/home-page/home-page.component';
import { FourthPageComponent } from './component/fourth-page/fourth-page.component';
import { FifthPageComponent } from './component/fifth-page/fifth-page.component';
import { SixthPageComponent } from './component/sixth-page/sixth-page.component'; 
import { SeventhPageComponent } from './component/seventh-page/seventh-page.component'; 
import { EighthPageComponent } from './component/eighth-page/eighth-page.component'; 
import { NinthPageComponent } from './component/ninth-page/ninth-page.component';
import { ProductsComponent } from './products/products.component';


export const routes: Routes = [

    {path:'', component:HomePageComponent, children:
    [{path:'secondPage', component:SecondPageComponent},
    {path:'thirdPage', component:ThirdPageComponent}, 
    {path:'fourthPage', component:FourthPageComponent},
    {path:'fifthPage', component:FifthPageComponent},
    {path:'sixthPage', component:SixthPageComponent},
    {path:'seventhPage', component:SeventhPageComponent}, 
    {path:'eighthPage', component:EighthPageComponent},
    {path:'ninthPage', component:NinthPageComponent},
    {path: "all", component:ProductsComponent}
]} ,
   

];
 