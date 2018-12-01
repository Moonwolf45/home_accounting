import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CategoriesService } from '../../shared/services/categories.service';
import { Category } from '../../shared/models/category.model';

@Component({
  selector: 'alc-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {

  @Output() onCategoryAdd = new EventEmitter<Category>();

  user_id: number = JSON.parse(window.localStorage.getItem('user')).id;

  constructor(private categoryService: CategoriesService) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    const { cname } = form.value.cname;
    let { capacity } = form.value.capacity;
    if (capacity < 0) {
      capacity *= -1;
    }

    const category = new Category(this.user_id, cname, capacity);

    this.categoryService.addCategory(category).subscribe((category_bd: Category) => {
      form.reset();
      form.form.patchValue({capacity: 1});
      this.onCategoryAdd.emit(category);
      console.log(category_bd);
    });

  }

}
