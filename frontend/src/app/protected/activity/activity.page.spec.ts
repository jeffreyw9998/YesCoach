import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {Activity} from './activity.page';

describe('NutritionComponent', () => {
  let component: Activity;
  let fixture: ComponentFixture<Activity>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Activity],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Activity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
