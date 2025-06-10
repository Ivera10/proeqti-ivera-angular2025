import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserDTO } from '../models/userDTO.model';
import { User } from '../models/user.model';

// @Injectable დეკორატორი აღნიშნავს, რომ ეს სერვისი შეიძლება დაინჯექტდეს სხვა კლასებში
@Injectable({
  providedIn: 'root', // Service is available throughout the app
})
export class UserService {
  private apiUrl = 'https://rentcar.stepprojects.ge/api/Users'; // API endpoint

  // BehaviorSubject is a special RxJS type that holds the current value and provides it to new subscriptions
  private currentUserSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);

  // Observable for listening to current user data
  public currentUser: Observable<User | null> =
    this.currentUserSubject.asObservable();

  private tokenCheckInterval: any; // Interval for checking token validity

  constructor(private http: HttpClient) {
    this.initUserFromStorage(); // Initialize from local storage
    this.startTokenValidityCheck(); // Start periodic token validity check
  }

  // Initialize user from localStorage - safe approach
  private initUserFromStorage(): void {
    try {
      const savedUserString = localStorage.getItem('currentUser');
      // Only try to parse if string is not null or undefined
      if (
        savedUserString &&
        savedUserString !== 'undefined' &&
        savedUserString !== 'null'
      ) {
        const savedUser = JSON.parse(savedUserString);
        this.currentUserSubject.next(savedUser); // Update user info in BehaviorSubject
        console.log('User loaded from storage:', !!savedUser);
      } else {
        console.log('No valid user data in storage');
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
      // Remove potentially corrupted data
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }

  // Register a new user
  register(user: UserDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  // User login - fully refactored for reliability
  login(user: Partial<UserDTO>): Observable<any> {
    console.log('Login attempt:', user);

    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap({
        next: (response) => {
          console.log('API response:', response);

          // Make sure we have a token before proceeding
          if (response && response.token) {
            try {
              // Save token first
              localStorage.setItem('token', response.token);

              // Then save user data if available
              if (response.user) {
                // Spread object with all data
                const fullUser = {
                  ...response.user,
                  token: response.token, // Add token to user object
                };

                const userJson = JSON.stringify(fullUser);
                localStorage.setItem('currentUser', userJson);
                this.currentUserSubject.next(fullUser);
                console.log(
                  'User data successfully saved:',
                  fullUser
                );
              } else {
                // Create minimal user object
                const minimalUser = {
                  phoneNumber: user.phoneNumber,
                  token: response.token,
                } as User;

                localStorage.setItem(
                  'currentUser',
                  JSON.stringify(minimalUser)
                );
                this.currentUserSubject.next(minimalUser);
                console.log(
                  'Minimal user profile created:',
                  minimalUser
                );

                // Try to fetch full user details
                this.fetchUserDetails().subscribe({
                  next: (userDetails) => {
                    console.log(
                      'User details fetched:',
                      userDetails
                    );
                  },
                  error: (err) => {
                    console.error(
                      'Error fetching user details:',
                      err
                    );
                  },
                });
              }
            } catch (error) {
              console.error('Error saving data:', error);
              // Even if local storage fails, we can still update in-memory state
              if (response.user) {
                this.currentUserSubject.next(response.user);
              }
            }
          } else {
            console.warn('No token in login response');
          }
        },
        error: (error) => {
          console.error('Login request failed:', error);
        },
      })
    );
  }

  // New method: fetch detailed user info from API
  fetchUserDetails(): Observable<User> {
    // Token must be provided in the request
    const token = localStorage.getItem('token');
    const currentUser = this.currentUserValue;

    // If token or user phone number is missing, abort
    if (!token || !currentUser?.phoneNumber) {
      return new Observable((observer) => {
        observer.error(
          'Token or user phone number is not available'
        );
        observer.complete();
      });
    }

    // HTTP headers with authorization token
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // API request to get user data by phone number
    return this.http
      .get<User>(`${this.apiUrl}/${currentUser.phoneNumber}`, { headers })
      .pipe(
        tap({
          next: (userDetails) => {
            if (userDetails) {
              // Add token to user object
              const enrichedUser: User = {
                ...userDetails,
                token: token,
              };

              // Update user info in localStorage and BehaviorSubject
              localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
              this.currentUserSubject.next(enrichedUser);

              console.log(
                'Full user data updated:',
                enrichedUser
              );
            }
          },
          error: (error) => {
            console.error('Error fetching user details:', error);
            // Do not clear existing info on error
          },
        })
      );
  }

  // User logout
  logout() {
    localStorage.removeItem('currentUser'); // Remove user data
    localStorage.removeItem('token'); // Remove auth token
    this.currentUserSubject.next(null); // Update BehaviorSubject with null
    console.log('User logged out');
  }

  // Get current authorized user
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Improved login check - more reliable
  isLoggedIn(): boolean {
    try {
      const hasToken = !!localStorage.getItem('token'); // Has token
      const hasUser =
        !!this.currentUserValue || !!localStorage.getItem('currentUser'); // Has user
      const isLoggedIn = hasToken && hasUser; // Logged in if both are true
      console.log(
        `Auth check: hasToken=${hasToken}, hasUser=${hasUser}, isLoggedIn=${isLoggedIn}`
      );
      return isLoggedIn;
    } catch (e) {
      console.error('Error checking login status:', e);
      return false;
    }
  }

  // Start periodic token validity check
  private startTokenValidityCheck(): void {
    // Check token validity every 30 seconds
    this.tokenCheckInterval = setInterval(() => {
      this.checkAndUpdateAuthStatus();
    }, 30000);
  }

  // Check token validity and update auth status
  private checkAndUpdateAuthStatus(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // No token found, log out
        console.log('No auth token found, logging out');
        this.logout();
        return;
      }

      // Check if token is expired (for JWT tokens)
      if (this.isTokenExpired(token)) {
        console.log('Auth token expired, logging out');
        this.logout();
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
    }
  }

  // Simple JWT token expiration check
  private isTokenExpired(token: string): boolean {
    try {
      // For JWT tokens - decode and check expiration
      // This is a simple implementation, more robust ones use JWT libraries
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        // Not a JWT token, cannot determine expiration
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload.exp) {
        // No expiration claim
        return false;
      }

      // Check token expiration (exp is in seconds, Date.now() is in ms)
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      // If parsing fails, conservatively assume token is valid
      return false;
    }
  }

  // Clean up resources when service is destroyed
  ngOnDestroy(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }
}
