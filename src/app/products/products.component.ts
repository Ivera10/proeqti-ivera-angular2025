import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Product } from '../models/products.model';
import { ProductsService } from '../products.service';
import { CheckboxControlValueAccessor, FormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
 

  products: Product[] = []; // პროდუქტების მასივი

  // კატეგორიების სია
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
  selectedCategoryId: number | null = null; // არჩეული კატეგორიის ID

  // ფორმის კონტროლების მოდელის ცვლადები
  selectedNutsFilter: string = 'all'; // არჩეული თხილის ფილტრი
  selectedSpiciness: string = ''; // არჩეული სიცხარე
  isVegeterianChecked: boolean = false; // ვეგეტარიანული ფილტრის მდგომარეობა

  // ფილტრების ობიექტი API მოთხოვნისთვის
  filters = {
    categoryId: undefined as number | undefined, // კატეგორიის ID
    vegeterian: undefined as boolean | undefined, // ვეგეტარიანული
    nuts: undefined as boolean | undefined, // თხილის შემცველობა
    spiciness: undefined as number | undefined, // სიცხარე
  };

  constructor(
    private productService: ProductsService, // პროდუქტების სერვისი

  ) {}

  ngOnInit() {
    this.applyFilters(); // ფილტრების გამოყენება კომპონენტის ჩატვირთვისას
    this.loadCategories(); // კატეგორიების ჩატვირთვა
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
    this.selectedCategoryId = categoryId; // არჩეული კატეგორიის დამახსოვრება
    this.filters.categoryId = categoryId > 0 ? categoryId : undefined; // თუ 0-ზე მეტია, მაშინ გამოიყენე კატეგორიის ID
    this.applyFilters(); // ფილტრების გამოყენება
  }

  // ფილტრის გადართვა მისი ტიპის მიხედვით
  toggleFilter(filterType: string, event: any, value?: string) {
    if (filterType === 'nuts') {
      // თხილის ფილტრი
      this.selectedNutsFilter = value || 'all'; // არჩეული ფილტრის მნიშვნელობის განახლება
      if (value === 'all') {
        this.filters.nuts = undefined; // ყველა პროდუქტის ჩვენება
      } else if (value === 'true') {
        this.filters.nuts = true; // მხოლოდ თხილის შემცველი პროდუქტები
      } else if (value === 'false') {
        this.filters.nuts = false; // მხოლოდ თხილის გარეშე პროდუქტები
      }
    } else if (filterType === 'vegeterian') {
      // ვეგეტარიანული ფილტრი
      this.isVegeterianChecked = event.target.checked; // ჩეკბოქსის მდგომარეობა
      this.filters.vegeterian = this.isVegeterianChecked; // ფილტრის განახლება
    } else if (filterType === 'spiciness') {
      // სიცხარის ფილტრი
      this.selectedSpiciness = event.target.value; // არჩეული სიცხარე
      this.filters.spiciness = this.selectedSpiciness
        ? parseInt(this.selectedSpiciness, 10) // სტრინგის რიცხვად გარდაქმნა
        : undefined; // თუ არცერთი არაა არჩეული, undefined იქნება
    }

    this.applyFilters(); // ფილტრების გამოყენება
  }



 // ფილტრების გადატვირთვა
  resetFilters() {
    this.filters = {
      categoryId:
        this.selectedCategoryId && this.selectedCategoryId > 0
          ? this.selectedCategoryId // შეინარჩუნე არჩეული კატეგორია
          : undefined,
      vegeterian: undefined, // ვეგეტარიანული ფილტრის გასუფთავება
      nuts: undefined, // თხილის ფილტრის გასუფთავება
      spiciness: undefined, // სიცხარის ფილტრის გასუფთავება
    };

    // მოდელის ცვლადების განულება
    this.selectedNutsFilter = 'all';
    this.selectedSpiciness = '';
    this.isVegeterianChecked = false;

    // ფილტრების გამოყენება
    this.applyFilters();
  }

  // ფილტრების გამოყენება API მოთხოვნისთვის
  applyFilters() {
    const params: any = {}; // პარამეტრების ობიექტი API მოთხოვნისთვის

    if (this.filters.categoryId !== undefined) {
      params.categoryId = this.filters.categoryId; // კატეგორიის ID-ის დამატება
    }

    if (this.filters.vegeterian !== undefined) {
      params.vegeterian = this.filters.vegeterian; // ვეგეტარიანული ფილტრის დამატება
    }

    if (this.filters.nuts !== undefined) {
      params.nuts = this.filters.nuts; // თხილის ფილტრის დამატება
    }

    if (this.filters.spiciness !== undefined) {
      params.spiciness = this.filters.spiciness; // სიცხარის ფილტრის დამატება
    }

    console.log('Applying filters with params:', params);
    this.productService.getFilteredProducts(params).subscribe(
      (data) => {
        console.log('Products received:', data);
        this.products = data; // მიღებული პროდუქტების განახლება
      },
      (error) => {
        console.error('Error fetching filtered products:', error); // შეცდომის გამოტანა
      }
    );
  }

  
}






























 // products: Product[] = [];


  // categories = [
  //   { id: 1, name: 'Salads' },
  //   { id: 2, name: 'Soups' },
  //   { id: 3, name: 'Chicken-dishes' },
  //   { id: 4, name: 'Beef-dishes' },
  //   { id: 5, name: 'Seafood-dishes' },
  //   { id: 6, name: 'Vegetable-dishes' },
  //   { id: 7, name: 'Bits-bites' },
  //   { id: 8, name: 'On-the-Side' },
  // ];
  // selectedCategoryId: number | null = null;
  // filters: any = {};
 
  // constructor(
  //   private productService: ProductsService,
    
  // ) {}

  
 
  // ngOnInit() {
  //   this.applyFilters();
  //   this.loadCategories();
  // }


  



  // loadCategories() {
  //   this.categories = [
      
  //     { id: 1, name: 'Salads' },
  //     { id: 2, name: 'Soups' },
  //     { id: 3, name: 'Chicken-dishes' },
  //     { id: 4, name: 'Beef-dishes' },
  //     { id: 5, name: 'Seafood-dishes' },
  //     { id: 6, name: 'Vegetable-dishes' },
  //     { id: 7, name: 'Bits-bites' },
  //     { id: 8, name: 'On-the-Side' },
  //   ];
  // }
 
  // fetchFilteredProducts(categoryId: number) {
  //   this.selectedCategoryId = categoryId;
  //   this.applyFilters();
  // }


 
  // toggleFilter(filterKey: string, event: Event) {
  //   const target = event.target as HTMLInputElement | HTMLSelectElement;
  //   const value = target.type === 'checkbox' ? target.checked : target.value;
  //   this.filters[filterKey] = value === '' ? null : value;
  //   this.applyFilters();
  // }


 






  // resetFilters() {
  //   this.filters = {};
  //   this.selectedCategoryId = null;
  //   this.applyFilters();
  // }

// resetFilters() {

//     this.filters = {};
//     this.selectedCategoryId = null;
//     this.applyFilters();


    
//   // Clear all checkboxes in the template
//   const checkboxes = document.querySelectorAll('input[type="checkbox"]');
//   checkboxes.forEach((checkbox) => {
//     (checkbox as HTMLInputElement).checked = false;
//   });

//   // Clear the spiciness select dropdown
//   const spicinessSelect = document.querySelector('select') as HTMLSelectElement;
//   if (spicinessSelect) {
//     spicinessSelect.value = ''; // Reset to "Not chosen"
//   }

// }


//   applyFilters() {
//     const filters = {
//       categoryId: this.selectedCategoryId,
//       ...this.filters,
//     };
//     this.productService.getFilteredProducts(filters).subscribe((data) => {
//       this.products = data;
//     });
//   }}
