import { Routes } from '@angular/router';
import { adminGuard } from './app/guards/admin.guard';
import { authGuard } from './app/guards/auth.guard';
import { bookingStepGuard } from './app/guards/booking-step.guard';
import { HomeComponent } from './app/pages/home/home.component';
import { ServiciosComponent } from './app/pages/servicios/servicios.component';
import { NosotrosComponent } from './app/pages/nosotros/nosotros.component';
import { ReservasComponent } from './app/pages/reservas/reservas.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'servicios', component: ServiciosComponent },
    { path: 'nosotros', component: NosotrosComponent },
    { path: 'login', loadComponent: () => import('./app/pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./app/pages/register/register.component').then(m => m.RegisterComponent) },
    { path: 'profile', loadComponent: () => import('./app/pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    { path: 'politicas', loadComponent: () => import('./app/pages/politicas/politicas.component').then(m => m.PoliticasComponent) },
    { path: 'reservas', component: ReservasComponent, canActivate: [authGuard] },
    { path: 'paso-1', loadComponent: () => import('./app/pages/paso-1/paso-1.component').then(m => m.Paso1Component) },
    { path: 'paso-2', loadComponent: () => import('./app/pages/paso-2/paso-2.component').then(m => m.Paso2Component), canActivate: [bookingStepGuard] },
    { path: 'paso-3', loadComponent: () => import('./app/pages/paso-3/paso-3.component').then(m => m.Paso3Component), canActivate: [bookingStepGuard] },
    { path: 'paso-4', loadComponent: () => import('./app/pages/paso-4/paso-4.component').then(m => m.Paso4Component), canActivate: [bookingStepGuard] },
    {
        path: 'admin',
        loadComponent: () => import('./app/pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [adminGuard],
        children: [
            { path: 'availability', loadComponent: () => import('./app/pages/admin/availability/admin-availability.component').then(m => m.AdminAvailabilityComponent) },
            { path: 'overview', loadComponent: () => import('./app/pages/admin/overview/admin-overview.component').then(m => m.AdminOverviewComponent) },
            { path: 'bookings', loadComponent: () => import('./app/pages/admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent) },
            { path: 'inventory', loadComponent: () => import('./app/pages/admin/inventory/admin-inventory.component').then(m => m.AdminInventoryComponent) },
            { path: 'reservation-list', loadComponent: () => import('./app/pages/admin/reservation-list/reservation-list.component').then(m => m.ReservationListComponent) },
            { path: 'users', loadComponent: () => import('./app/pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
            { path: '', redirectTo: 'overview', pathMatch: 'full' }
        ]
    },
    { path: 'booking/summary', loadComponent: () => import('./app/pages/booking/summary/summary.component').then(m => m.SummaryComponent) },
    { path: 'booking/confirmation/:id', loadComponent: () => import('./app/pages/paso-5/paso-5.component').then(m => m.Paso5Component) },
    { path: 'paso-5/:id', loadComponent: () => import('./app/pages/paso-5/paso-5.component').then(m => m.Paso5Component) },
    { path: 'contrato', loadComponent: () => import('./app/pages/contrato/contrato.component').then(m => m.ContratoComponent) },
    { path: '**', loadComponent: () => import('./app/pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
