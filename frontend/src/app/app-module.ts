import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './basic/header/header';
import { Main } from './basic/main/main';
import { Footer } from './basic/footer/footer';
import { Dorama } from './content/dorama/dorama';
import { Films } from './content/films/films';
import { Series } from './content/series/series';
import { MainPagination } from './paginations/main-pagination/main-pagination';
import { NewFilmsPagination } from './paginations/new-films-pagination/new-films-pagination';
import { NewFilmsService } from './services/new-films-service';
import { Service } from './services/service';
import { NewFilms } from './basic/new-films/new-films';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SortService } from './services/sort-service';
import { Sort } from './content/sort/sort';

@NgModule({
  declarations: [
    App,
    Header,
    Main,
    Footer,
    Dorama,
    Films,
    Series,
    MainPagination,
    NewFilmsPagination,
    NewFilms,
    Sort,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    NewFilmsService,
    Service,
    SortService
  ],
  bootstrap: [App]
})
export class AppModule { }
