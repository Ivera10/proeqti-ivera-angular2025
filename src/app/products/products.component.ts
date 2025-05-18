







import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { Product } from '../models/products.model'; 
import { ProductsService } from '../products.service'; 
import { BasketService } from '../services/basket.service'; 
import { FormsModule } from '@angular/forms'; 
import { RouterLink, RouterModule } from '@angular/router';
 

@Component({
  selector: 'app-products', 
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterLink, RouterModule], 
  templateUrl: './products.component.html', 
  styleUrls: ['./products.component.css'], 
})
export class ProductsComponent implements OnInit {
  products: Product[] = []; 
 
  // კატეგორიების მასივი
  categories = [
    { id: 1, name: 'Salads' },
    { id: 2, name: 'Soups' },
    { id: 3, name: 'Chicken-dishes' },
    { id: 4, name: 'Beef-dishes' },
    { id: 5, name: 'Seafood-dishes' },
    { id: 6, name: 'Vegetable-dishes' },
    { id: 7, name: 'Bits-bites' },
    { id: 8, name: 'On-the-Side' },
  ];
  selectedCategoryId: number | null = null; 
 
  // ფილტრების მნიშვნელობები
  selectedNutsFilter: string = 'all';
  selectedSpiciness: string = '';
  isVegeterianChecked: boolean = false; 
 
  // ფილტრების ობიექტი
  filters = {
    categoryId: undefined as number | undefined, 
    vegeterian: undefined as boolean | undefined, 
    nuts: undefined as boolean | undefined, 
    spiciness: undefined as number | undefined, 
  };

  constructor(
    private productService: ProductsService, 
    private basketService: BasketService 
  ) {}
  
  ngOnInit() {
    this.applyFilters(); 
    this.loadCategories(); 
  }
 
  // კატეგორიების ჩატვირთვის მეთოდი
  loadCategories() {
    this.categories = [
      { id: 1, name: 'Salads' },
      { id: 2, name: 'Soups' },
      { id: 3, name: 'Chicken-dishes' },
      { id: 4, name: 'Beef-dishes' },
      { id: 5, name: 'Seafood-dishes' },
      { id: 6, name: 'Vegetable-dishes' },
      { id: 7, name: 'Bits-bites' },
      { id: 8, name: 'On-the-Side' },
    ];
  }
 
  // პროდუქტების გაფილტვრა კატეგორიის მიხედვით
  fetchFilteredProducts(categoryId: number) {
    console.log('Fetching products for category:', categoryId);
    this.selectedCategoryId = categoryId;
    this.filters.categoryId = categoryId > 0 ? categoryId : undefined;
    this.applyFilters(); 
  }
 

  toggleFilter(filterType: string, event: any, value?: string) {
    if (filterType === 'nuts') {

      this.selectedNutsFilter = value || 'all'; 
      if (value === 'all') {
        this.filters.nuts = undefined; 
      } else if (value === 'true') {
        this.filters.nuts = true; 
      } else if (value === 'false') {
        this.filters.nuts = false; 
      }
    } else if (filterType === 'vegeterian') {
     
      this.isVegeterianChecked = event.target.checked;
      this.filters.vegeterian = this.isVegeterianChecked;
    } else if (filterType === 'spiciness') {
      
      this.selectedSpiciness = event.target.value; 
      this.filters.spiciness = this.selectedSpiciness
        ? parseInt(this.selectedSpiciness, 10) 
        : undefined; 
    }
 
    this.applyFilters(); 
  }
 
  // ისევ დაბრუნება ფილტრების საწყის მდგომარეობაში
  resetFilters() {
    this.filters = {
      categoryId:
        this.selectedCategoryId && this.selectedCategoryId > 0
          ? this.selectedCategoryId 
          : undefined,
      vegeterian: undefined, 
      nuts: undefined, 
      spiciness: undefined, 
    };
 
 
    this.selectedNutsFilter = 'all';
    this.selectedSpiciness = '';
    this.isVegeterianChecked = false;
 
  
    this.applyFilters();
  }
 
  // ფილტრების გამოყენება API მოთხოვნისთვის
  applyFilters() {
    const params: any = {}; 
 
    if (this.filters.categoryId !== undefined) {
      params.categoryId = this.filters.categoryId; 
    }
 
    if (this.filters.vegeterian !== undefined) {
      params.vegeterian = this.filters.vegeterian; 
    }
 
    if (this.filters.nuts !== undefined) {
      params.nuts = this.filters.nuts; 
    }
 
    if (this.filters.spiciness !== undefined) {
      params.spiciness = this.filters.spiciness;
    }
 
    console.log('Applying filters with params:', params);
    this.productService.getFilteredProducts(params).subscribe(
      (data) => {
        console.log('Products received:', data);
        this.products = data; 
      },
      (error) => {
        console.error('Error fetching filtered products:', error); 
      }
    );
  }
 
  // კალათაში დამატების მეთოდი
  addToCart(product: Product, button?: HTMLButtonElement): void {
    console.log('Adding to cart:', product);
 
    // ღილაკის ცსს 
    if (button) {
      button.classList.add('adding'); 
      button.textContent = 'Adding...'; 
 
    }
 
    this.basketService.addToBasket(product).subscribe(
      () => {
        console.log('Product added to cart successfully');
        // this.showNotification(`✅ ${product.name} added to cart`, false, true); 
 
        // ანუ რა ცსს იც მივეცი სულ ეგრე რომ არ დარჩეს  adding ზე ისევ Add to cart ში აბრუნებს
        setTimeout(() => {
          if (button) {
            button.classList.remove('adding'); 
            button.textContent = 'Add to cart'; 
          }
        }, 500);
      },
      (error) => {
        console.error('Error adding to basket:', error);
        // this.showNotification('❌ Failed to add to cart', true); 
 
        
        if (button) {
          button.classList.remove('adding');
          button.textContent = 'Add to cart';
        }
      }
    );
  }
 


  
  showNotification(
  message: string,         // გამოსატანი ტექსტი
  isError: boolean = false, // არის თუ არა შეცდომა
  isCart: boolean = false   // ნიშნავს თუ არა რომ კალათაში დაემატა
): void {
    console.log('Showing notification:', message, isError);
 
    const notification = document.createElement('div'); 
    notification.textContent = message; 

    //ცსს კლასი ენიჭება აქ 
    notification.className = isError
      ? 'notification error' 
      : isCart
      ? 'notification cart-success' 
      : 'notification success'; 
 
    document.body.appendChild(notification); 
 
      // ცსს დრო ანიმაცია
    setTimeout(() => {
      notification.classList.add('fade-out'); 
      setTimeout(() => {
        document.body.removeChild(notification); 
      }, 500);
    }, 3000);
  }
}