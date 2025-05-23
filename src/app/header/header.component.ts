import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BasketService } from '../services/basket.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  cartItemCount: number = 0;
  isMenuOpen: boolean = false;
  userName: string = 'მომხმარებელი';

  constructor(
    private basketService: BasketService,
    public userService: UserService // მომხმარებლის სერვისი, public რათა HTML-დან წვდომა იყოს
  ) {}

  ngOnInit(): void {
    // კალათის რაოდენობის მოსმენა
    this.basketService.getTotalItems().subscribe((count) => {
      this.cartItemCount = count;
    });

    // მომხმარებლის სახელის განახლება
    this.userService.currentUser.subscribe((user) => {
      if (user && user.firstName && user.lastName) {
        this.userName = `${user.firstName} ${user.lastName}`;
      } else if (user && user.firstName) {
        this.userName = user.firstName;
      } else if (user && user.phoneNumber) {
        this.userName = user.phoneNumber;
      } else {
        this.userName = 'მომხმარებელი';
      }
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    const navigation = document.querySelector('.navigation');
    const hamburger = document.querySelector('.hamburger');
    if (
      this.isMenuOpen &&
      navigation &&
      hamburger &&
      !navigation.contains(clickedElement) &&
      !hamburger.contains(clickedElement)
    ) {
      this.closeMenu();
    }
  }

  // Close menu on window resize
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMenu();
    }
  }

  // მომხმარებლის სახელი
  getUserName(): string {
    return this.userName;
  }

  // სისტემიდან გასვლა
  logout(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.userService.logout();
  }
}

