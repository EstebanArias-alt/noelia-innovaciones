import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevosIngresosComponent } from './nuevos-ingresos.component';

describe('NuevosIngresosComponent', () => {
  let component: NuevosIngresosComponent;
  let fixture: ComponentFixture<NuevosIngresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevosIngresosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevosIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
