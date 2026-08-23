import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerPromocionalComponent } from './banner-promocional.component';

describe('BannerPromocionalComponent', () => {
  let component: BannerPromocionalComponent;
  let fixture: ComponentFixture<BannerPromocionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerPromocionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerPromocionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
