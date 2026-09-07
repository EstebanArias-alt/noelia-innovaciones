import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductoFormComponent } from './admin-producto-form.component';

describe('AdminProductoFormComponent', () => {
  let component: AdminProductoFormComponent;
  let fixture: ComponentFixture<AdminProductoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
