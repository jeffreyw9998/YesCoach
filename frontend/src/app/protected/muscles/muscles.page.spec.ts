import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Muscles } from './muscles.page';

describe('NutritionComponent', () => {
  let component: Muscles;
  let fixture: ComponentFixture<Muscles>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Muscles ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Muscles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
