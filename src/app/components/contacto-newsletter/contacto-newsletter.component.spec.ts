import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoNewsletterComponent } from './contacto-newsletter.component';

describe('ContactoNewsletterComponent', () => {
  let component: ContactoNewsletterComponent;
  let fixture: ComponentFixture<ContactoNewsletterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactoNewsletterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactoNewsletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
