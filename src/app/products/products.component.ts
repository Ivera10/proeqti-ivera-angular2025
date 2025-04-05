import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Product } from '../models/products.model';
import { ProductsService } from '../products.service';
import { CheckboxControlValueAccessor } from '@angular/forms';
 
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];


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
  filters: any = {};
 
  constructor(
    private productService: ProductsService,
    
  ) {}

  
 
  ngOnInit() {
    this.applyFilters();
    this.loadCategories();
  }
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
 
  fetchFilteredProducts(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.applyFilters();
  }
 
  toggleFilter(filterKey: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.filters[filterKey] = value === '' ? null : value;
    this.applyFilters();
  }
 




  // resetFilters() {
  //   this.filters = {};
  //   this.selectedCategoryId = null;
  //   this.applyFilters();
  // }

resetFilters() {

    this.filters = {};
    this.selectedCategoryId = null;
    this.applyFilters();


    
  // Clear all checkboxes in the template
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    (checkbox as HTMLInputElement).checked = false;
  });

  // Clear the spiciness select dropdown
  const spicinessSelect = document.querySelector('select') as HTMLSelectElement;
  if (spicinessSelect) {
    spicinessSelect.value = ''; // Reset to "Not chosen"
  }

}


  applyFilters() {
    const filters = {
      categoryId: this.selectedCategoryId,
      ...this.filters,
    };
    this.productService.getFilteredProducts(filters).subscribe((data) => {
      this.products = data;
    });
  }}


  

