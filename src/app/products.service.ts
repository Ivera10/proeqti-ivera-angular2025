
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './models/products.model';

 
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = 'https://restaurant.stepprojects.ge/api/Products';
 
  constructor(private http: HttpClient) {}
 
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/GetAll`);
  }
 
  getFilteredProducts(filters: any): Observable<Product[]> {
    let params = new HttpParams();
    if (filters.categoryId) {
      params = params.set('categoryId', filters.categoryId.toString());
    }
    if (filters.nuts !== undefined) {
      params = params.set('nuts', filters.nuts.toString());
    }
    if (filters.vegetarian !== undefined) {
      params = params.set('vegetarian', filters.vegetarian.toString());
    }
    if (filters.spiciness !== undefined) {
      params = params.set('spiciness', filters.spiciness.toString());
    }
    return this.http.get<Product[]>(`${this.apiUrl}/GetFiltered`, { params });
  }
 
  // deleteProduct(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/Delete/${id}`);
  // }
}