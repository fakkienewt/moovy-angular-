import { Component, OnInit } from '@angular/core';
import { Service } from '../../services/service';
import { Filter } from '../../models.ts/filter.model';

@Component({
  selector: 'app-filters',
  standalone: false,
  templateUrl: './filters.html',
  styleUrl: './filters.scss'
})
export class Filters implements OnInit {

  filter: Filter | null = null;

  selectedType: string = '';
  selectedGenre: string = '';
  selectedYear: string = '';
  selectedCountry: string = '';

  constructor(
    private service: Service
  ) { }

  ngOnInit(): void {
    this.printData();
  }

  printData(): void {
    this.service.getFilterData().subscribe({
      next: (data: Filter) => {
        this.filter = data;
        console.log('Received data:', this.filter);
      },
      error: (error: any) => {
        console.error('ERROR:', error);
      }
    });
  }

  onClickCheck(): void {
    console.log('Выбранные:', {
      type: this.selectedType,
      genre: this.selectedGenre,
      year: this.selectedYear,
      country: this.selectedCountry
    });
  }

  onReset(): void {
    this.selectedType = '';
    this.selectedGenre = '';
    this.selectedYear = '';
    this.selectedCountry = '';
  }
}