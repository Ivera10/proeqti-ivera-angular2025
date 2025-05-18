

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../products.service';
import { Product } from '../models/products.model';
import { BasketService } from '../services/basket.service';
import { RouterModule } from '@angular/router';
 
@Component({
  selector: 'app-card-page',
  templateUrl: './card-page.component.html',
  styleUrls: ['./card-page.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class CardPageComponent implements OnInit {

  //ეს BasketComponent არის Angular კომპონენტი, რომელიც მართავს კალათის 
  // გვერდს (კალათის ნახვა, რაოდენობის შეცვლა, წაშლა და ა.შ.).


  product: Product | null = null;
  loading = true;
  error = false;
 
  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private basketService: BasketService
  ) {}
 
  // კომპონენტის ჩატვირთვისას იძახებს loadBasketItems()-ს.
  ngOnInit() {
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.error = true;
        this.loading = false;
      }
    });
  }
 

  // იტვირთება კალათის ელემენტები სერვისიდან და ითვლის ჯამურ თანხას.
  loadProduct(id: number) {
    this.loading = true;
    this.productsService.getAllProducts().subscribe(
      (products) => {
        const foundProduct = products.find((p) => p.id === +id);
        if (foundProduct) {
          this.product = foundProduct;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading product:', error);
        this.error = true;
        this.loading = false;
      }
    );
  }

  // კალათში პროდუქტის დამატების მეთოდი
  addToCart(product: Product) { 



    if (product) {
      this.basketService.addToBasket(product).subscribe(
        () => {
          // this.showNotification(`✅ ${product.name} added to cart`);
        },
        (error) => {
          console.error('Error adding to cart:', error);
          // this.showNotification('❌ Failed to add to cart', true);
        }
      );
    }
  }
 



  // ეს არის ფუნქცია, რომელიც აჩვენებს დროებით შეტყობინებას (notification) ეკრანზე.
// (მაგ: წარმატებით დაემატა კალათაში პროდუქტი
// მოხდა შეცდომა)

  showNotification(message: string, isError: boolean = false) {
    // კლასს აძლევს
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = isError
      ? 'notification error'
      : 'notification success';
 
    document.body.appendChild(notification);
 

    // 3 წამში ამატებს კლასს fade-out (ანიმაციისთვის).
    // ნახევარ წამში (ანიმაციის დასრულების შემდეგ) შლის შეტყობინებას გვერდიდან.

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
}