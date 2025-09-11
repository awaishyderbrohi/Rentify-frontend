import { Component } from '@angular/core';
import { ToasterService } from '../../services/toaster/toaster.service';
import {  HeroComponent } from "./hero-section/hero-section.component"
import { FeaturedListingsComponent } from "./featured-listings/featured-listings.component";
import { CategoriesSectionComponent } from "./categories-section/categories-section.component";

@Component({
  selector: 'app-home',
  imports: [HeroComponent, FeaturedListingsComponent, CategoriesSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(){}
}
