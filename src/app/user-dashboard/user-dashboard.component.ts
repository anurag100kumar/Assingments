import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { User, UserService } from '../user.service';
import { Chart } from 'chart.js/auto';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatDialogModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, AfterViewInit  {
  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'role'];
  rolesChart: Chart | undefined;

  @ViewChild('rolesChartCanvas') rolesChartCanvas!: ElementRef;
  @ViewChild('addUserButton') addUserButton!: ElementRef;

  constructor(private userService: UserService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.userService.users$.subscribe(users => {
      this.users = users;
      this.updateChart();
    });
  }
  ngAfterViewInit(): void {
    this.updateChart();
  }

  async openUserFormDialog() {
    if (this.addUserButton?.nativeElement) {
      this.addUserButton.nativeElement.blur();
    }
    const { UserFormComponent } = await import('../user-form/user-form/user-form.component');
    
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '800px',
      autoFocus: true,
      disableClose: true,
       panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.addUser(result);
      }
    });
  }

  updateChart() {
    if (!this.rolesChartCanvas || !this.rolesChartCanvas.nativeElement) {
      return;
    }

    const roleCounts = { Admin: 0, Editor: 0, Viewer: 0 };
    this.users.forEach((user) => {
      roleCounts[user.role as 'Admin' | 'Editor' | 'Viewer'] = (roleCounts[user.role as 'Admin' | 'Editor' | 'Viewer'] || 0) + 1;
    });

    if (this.rolesChart) {
      this.rolesChart.destroy();
    }

    this.rolesChart = new Chart(this.rolesChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Admin', 'Editor', 'Viewer'],
        datasets: [
          {
            data: [roleCounts['Admin'], roleCounts['Editor'], roleCounts['Viewer']],
            backgroundColor: ['#383838', '#1c4980', '#FFCE56'],
          },
        ],
      },
    });
  }
}
