import { Component, OnInit } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { AuthService } from './services/auth/auth.service';
import { ToasterComponent } from "./shared/toaster/toaster.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ToasterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  constructor(private authService:AuthService){}

  ngOnInit(): void {
    this.authService.loadUser();
  }

  //  showNavbar = true;

  // constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  //   this.router.events
  //     .pipe(filter(event => event instanceof NavigationEnd))
  //     .subscribe(() => {
  //       let currentRoute = this.activatedRoute.root;

  //       // Walk down to the active child route
  //       while (currentRoute.firstChild) {
  //         currentRoute = currentRoute.firstChild;
  //       }

  //       this.showNavbar = !currentRoute.snapshot.data['hideNavbar'];
  //     });
  // }

}
