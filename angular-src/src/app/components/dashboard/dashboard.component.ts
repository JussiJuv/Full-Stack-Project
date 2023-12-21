import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userTasks: any[];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.getTasks().subscribe(data => {
      data.tasks.forEach(element => {
        const newTask = {
          description: element,
          completed: false,
        };
        this.tasks.push(newTask);
        this.newTask = '';
      });
    }

    );    
  }

  newTask: string = '';
  tasks: {
    description: string,
    completed: boolean
  }[] = [];

  addTask() {
    if(this.newTask.trim() != '') {
      const newTask = {
        description: this.newTask,
        completed: false,
      };
      this.tasks.push(newTask);
      this.newTask = '';
    }
  }

  deleteTask(index: number) {
    this.tasks.splice(index, 1);
  }

  saveTasks() {
    this.authService.saveTasks(this.tasks).subscribe(data => {
      if (data.success) {
        console.log('Task saved succesfully: ', data.user);
      } else {
        console.log('Failed to save tasks: ', data.msg);
      }
    });
    window.location.reload();
  }

  getUsername() {
    return this.authService.getUsername();
  }

}
