import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { ProductsComponent } from '../../products/products.component';


@Component({
  selector: 'app-home-page',
  imports: [RouterModule, ProductsComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
