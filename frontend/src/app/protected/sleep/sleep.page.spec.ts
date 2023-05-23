import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

import { SleepPage } from './sleep.page';

describe('Tab3Page', () => {
  let component: SleepPage;
  let fixture: ComponentFixture<SleepPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SleepPage, IonicModule, ExploreContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SleepPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
