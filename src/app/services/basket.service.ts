import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Product } from '../models/products.model';
 

export interface BasketItem {
  id?: number;
  quantity: number;
  price: number;
  productId: number;
  product?: Product;
  clientId?: number; 
}
 
@Injectable({
  providedIn: 'root',
})
export class BasketService {

//   GET მეთოდი
// გამოიყენება სერვერიდან ინფორმაციის მისაღებად.


// POST მეთოდი
// გამოიყენება სერვერზე ინფორმაციის გასაგზავნად ან ახალი მონაცემის შესაქმნელად.


  //ეს BasketService არის Angular სერვისი, რომელიც მართავს კალათის (basket)
  // მონაცემებს ონლაინ მაღაზიაში. მისი ძირითადი დანიშნულებაა კალათაში 
  // პროდუქტების დამატება, წაშლა, განახლება და კალათის მონაცემების მიღება
  //  სერვერიდან.


  private apiUrl = 'https://restaurant.stepprojects.ge/api/Baskets';
  private basketItemsSubject = new BehaviorSubject<BasketItem[]>([]);
  public basketItems$ = this.basketItemsSubject.asObservable();
 
  constructor(private http: HttpClient) {
    this.loadBasket();
  }
 
  loadBasket(): void {
    console.log('Loading basket data from server');
    this.http
      .get<BasketItem[]>(`${this.apiUrl}/GetAll`)
      .pipe(
        catchError((error) => {
          console.error('Error loading basket:', error);
          return [];
        })
      )
      .subscribe((items) => {
        console.log('Received basket items from server:', items);
 
       
        const itemsWithIndex = items.map((item, index) => {
         
          return {
            ...item,
            clientId: index,
            quantity: item.quantity || 1, 
          };
        });
 
        console.log('Processed basket items:', itemsWithIndex);
        this.basketItemsSubject.next(itemsWithIndex || []);
      });
  }
 
  getBasketItems(): Observable<BasketItem[]> {
    return this.basketItems$;
  }
 
  addToBasket(product: Product, quantity: number = 1): Observable<BasketItem> {
    console.log('Adding to basket:', product, quantity);
 
   
    const basketItem: BasketItem = {
      quantity: 1,
      price: product.price,
      productId: product.id,
    };
 
    return this.http
      .post<BasketItem>(`${this.apiUrl}/AddToBasket`, basketItem)
      .pipe(
        tap(() => {
          console.log('Item added to basket, reloading basket data');
          this.loadBasket(); 
        }),
        catchError((error) => {
          console.error('Error adding to basket:', error);
          throw error;
        })
      );
  }
 
  updateBasketItem(basketItem: BasketItem): Observable<any> {
    console.log('Updating basket item:', basketItem);
 
    const productIdToUse = basketItem.product?.id || basketItem.productId;
 
    if (productIdToUse) {
      const updatedItem = {
        quantity: basketItem.quantity,
        price: basketItem.price,
        productId: productIdToUse,
      };
 
      console.log('Sending updated item to AddToBasket:', updatedItem);
 
     
      const currentItems = this.basketItemsSubject.getValue();
      const index = currentItems.findIndex(
        (item) =>
          item.product?.id === productIdToUse ||
          item.productId === productIdToUse
      );
 
      if (index !== -1) {
        const updatedItems = [...currentItems];
        updatedItems[index] = {
          ...currentItems[index],
          quantity: basketItem.quantity,
        };
        this.basketItemsSubject.next(updatedItems);
      }
 
      
      return this.http
        .delete(`${this.apiUrl}/DeleteProduct/${productIdToUse}`)
        .pipe(
          tap(() => {
            console.log('Previous item removed, now adding updated item');
 
            // Now add the updated item
            return this.http
              .post<BasketItem>(`${this.apiUrl}/AddToBasket`, updatedItem)
              .pipe(
                tap(() => {
                  console.log('Item updated with new quantity');
                 
                }),
                catchError((addError) => {
                  console.error('Error adding updated item:', addError);
                  return of({ error: addError });
                })
              )
              .subscribe();
          }),
          catchError((error) => {
            console.error('Error removing before update:', error);

            return this.http
              .post<BasketItem>(`${this.apiUrl}/AddToBasket`, updatedItem)
              .pipe(
                tap(() => {
                  console.log('Item updated with direct add');
                  this.loadBasket();
                }),
                catchError((addError) => {
                  console.error('Error on direct add:', addError);
                  return of({ error: addError });
                })
              );
          })
        );
    } else {
      console.error('No valid product ID for update');
      return throwError(() => new Error('No valid product ID for update'));
    }
  }
 
  removeFromBasket(
    id: number | undefined,
    productId?: number,
    clientId?: number
  ): Observable<any> {
    console.log(
      'Removing from basket - ID:',
      id,
      'ProductID:',
      productId,
      'ClientID:',
      clientId
    );
 
    const currentItems = this.basketItemsSubject.getValue();
    const itemToRemove =
      clientId !== undefined ? currentItems[clientId] : undefined;
    const productIdToUse = itemToRemove?.product?.id;
 
    console.log('Item to remove:', itemToRemove);
    console.log('Product ID to use for deletion:', productIdToUse);
 
    if (productIdToUse) {
      return this.http
        .delete(`${this.apiUrl}/DeleteProduct/${productIdToUse}`)
        .pipe(
          tap(() => {
            console.log('Item removed, reloading basket data');
            this.loadBasket();
          }),
          catchError((error) => {
            console.error('Error removing item using product ID:', error);
            throw error;
          })
        );
    } else {
      console.error('No valid product ID found to delete');
      return throwError(() => new Error('No valid product ID found to delete'));
    }
  }
 
  // ანუ აჩვენებს რამდენი პროდუქტი გვაქვს კალათაში
  getTotalItems(): Observable<number> {
    return new Observable<number>((observer) => {
      this.basketItems$.subscribe((items) => {
        const total = items.reduce((sum, item) => sum + item.quantity, 0);
        observer.next(total);
      });
    });
  }
  // ანუ აჩვენებს კალათაში ჯამურ თანხას(მთლიანად)
  getTotalPrice(): Observable<number> {
    return new Observable<number>((observer) => {
      this.basketItems$.subscribe((items) => {
        const total = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        observer.next(total);
      });
    });
  }
 
  //იღებს კალათის ყველა ელემენტს და ბეჭდავს 
  // დეტალურ ინფორმაციას კონსოლში (დასახმარებლად/დასატესტად).
  // არაა საჭირო უბრალოდ დასატესტად
  inspectBasketItems(): void {
    this.http
      .get<any>(`${this.apiUrl}/GetAll`, { observe: 'response' })
      .subscribe(
        (response) => {
          console.log('Full API Response:', response);
          console.log('Response Headers:', response.headers);
          console.log('Response Status:', response.status);
          console.log('Response Body:', response.body);
 
          if (Array.isArray(response.body)) {
            const sampleItem = response.body[0];
            if (sampleItem) {
              console.log('Sample Item Keys:', Object.keys(sampleItem));
 
              Object.keys(sampleItem).forEach((key) => {
                if (
                  key.toLowerCase().includes('id') ||
                  key === 'id' ||
                  key === '_id'
                ) {
                  console.log(
                    `Potential ID field found: ${key} = ${sampleItem[key]}`
                  );
                }
              });
            }
          }
        },
        (error) => console.error('Failed to inspect basket items:', error)
      );
  }
 


  //სხვადასხვა მეთოდით ცდილობს კალათიდან ელემენტის წაშლას 
  // (სხვადასხვა ID-ით ან body-ით), 
  // რათა ნახოს რომელი მუშაობს სწორად API-ზე.

  testDeleteMethods(item: BasketItem): void {
    console.log('Testing delete methods for item:', item);
 
    if (item.id) {
      this.http.delete(`${this.apiUrl}/DeleteProduct/${item.id}`).subscribe(
        (response) => console.log('Method 1 success (by ID):', response),
        (error) => console.error('Method 1 failed (by ID):', error)
      );
    }
 
    if (item.productId) {
      this.http
        .delete(`${this.apiUrl}/DeleteProduct/${item.productId}`)
        .subscribe(
          (response) =>
            console.log('Method 2 success (by productId):', response),
          (error) => console.error('Method 2 failed (by productId):', error)
        );
    }
 
    if (item.product?.id) {
      this.http
        .delete(`${this.apiUrl}/DeleteProduct/${item.product.id}`)
        .subscribe(
          (response) =>
            console.log('Method 2.5 success (by product.id):', response),
          (error) => console.error('Method 2.5 failed (by product.id):', error)
        );
    }
 
    this.http
      .request('delete', `${this.apiUrl}/DeleteProduct`, { body: item })
      .subscribe(
        (response) => console.log('Method 3 success (item in body):', response),
        (error) => console.error('Method 3 failed (item in body):', error)
      );
 
    this.http
      .request('delete', this.apiUrl, {
        body: { productId: item.productId },
      })
      .subscribe(
        (response) =>
          console.log('Method 4 success (productId in body):', response),
        (error) => console.error('Method 4 failed (productId in body):', error)
      );
  }
}
 