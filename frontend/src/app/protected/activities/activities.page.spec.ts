import {ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ExploreContainerComponent} from '../explore-container/explore-container.component';

import {ActivitiesPage} from './activities.page';

describe('Tab2Page', () => {
  let component: ActivitiesPage;
  let fixture: ComponentFixture<ActivitiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesPage, IonicModule, ExploreContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
