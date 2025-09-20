import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sort } from './sort';

describe('Sort', () => {
  let component: Sort;
  let fixture: ComponentFixture<Sort>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sort]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sort);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
