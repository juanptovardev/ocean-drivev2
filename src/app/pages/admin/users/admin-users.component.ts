import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, User } from '../../../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-8">
        <!-- Section 1: Administrators -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 bg-[#1A202E] transition-colors group">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4 cursor-pointer" role="button" tabindex="0" (click)="isAdminExpanded.set(!isAdminExpanded())" (keydown.enter)="isAdminExpanded.set(!isAdminExpanded())" (keydown.space)="isAdminExpanded.set(!isAdminExpanded()); $event.preventDefault()">
                        <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-white/20 transition-colors">
                            <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-sm font-black text-white uppercase tracking-widest">Administradores</h2>
                                <svg class="w-4 h-4 text-white/30 transition-transform duration-300" [class.rotate-180]="isAdminExpanded()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <p class="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">{{ adminUsers().length }} admins registrados</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 flex-1 justify-end max-w-xl">
                        <!-- Admin Search -->
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input type="text" 
                                   [ngModel]="adminSearchQuery()" 
                                   (ngModelChange)="adminSearchQuery.set($event)"
                                   (click)="$event.stopPropagation()"
                                   class="block w-full pl-9 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white/10 sm:text-xs transition-all" 
                                   placeholder="Buscar admins...">
                        </div>

                        <button (click)="$event.stopPropagation(); openCreateModal('admin')" 
                                class="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1A202E] rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-gray-100 transition-all shadow-lg shadow-black/20 hover:scale-105 active:scale-95 shrink-0">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Admin
                        </button>
                    </div>
                </div>
            </div>
            
            @if (isAdminExpanded()) {
                <div class="p-6 animate-fade-in">
                    @if (isLoading()) {
                        <div class="flex items-center justify-center py-12">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                        </div>
                    } @else if (adminUsers().length === 0) {
                        <div class="text-center py-12">
                            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <p class="text-gray-500 italic">No hay administradores registrados</p>
                        </div>
                    } @else {
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                        <th class="pb-4 pl-2">Administrador</th>
                                        <th class="pb-4 hidden md:table-cell">Teléfono</th>
                                        <th class="pb-4 hidden lg:table-cell">Vinculación</th>
                                        <th class="pb-4 text-right pr-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-50">
                                    @for (user of paginatedAdmins(); track user.id) {
                                        <tr class="hover:bg-gray-50/50 transition-colors group">
                                            <td class="py-4 pl-2">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 bg-gradient-to-br from-slate-700 to-[#1A202E] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-amber-400/20">
                                                        {{ user.name.charAt(0).toUpperCase() }}
                                                    </div>
                                                    <div>
                                                        <div class="flex items-center gap-2">
                                                            <p class="font-bold text-slate-800 text-sm tracking-tight">{{ user.name }}</p>
                                                            @if (isCurrentUser(user)) {
                                                                <span class="px-2 py-0.5 text-[8px] font-black bg-amber-100 text-amber-700 rounded-full tracking-widest">TÚ</span>
                                                            }
                                                        </div>
                                                        <p class="text-[11px] text-gray-400">{{ user.email }}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="py-4 hidden md:table-cell">
                                                <span class="text-xs font-bold text-slate-600 tracking-tight">{{ user.phone || '—' }}</span>
                                            </td>
                                            <td class="py-4 hidden lg:table-cell">
                                                <span class="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">{{ formatDate(user.created_at) }}</span>
                                            </td>
                                            <td class="py-4 pr-2">
                                                <div class="flex items-center justify-end gap-2">
                                                    <button (click)="openEditModal(user)" 
                                                            class="p-2 text-slate-700 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                                                            title="Editar Usuario">
                                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    @if (!isCurrentUser(user)) {
                                                        <button (click)="demoteToUser(user)" 
                                                                class="p-2 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                                title="Degradar a Usuario">
                                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                            </svg>
                                                        </button>
                                                        <button (click)="confirmDelete(user)" 
                                                                class="p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Eliminar Permanente">
                                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    } @else {
                                                        <span class="text-[10px] text-slate-300 font-bold uppercase tracking-widest pr-2">Principal</span>
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination for Admins -->
                        @if (totalAdminPages() > 1) {
                            <div class="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                <p class="text-[10px] text-slate-700 font-bold uppercase">Paginado: {{ ADMINS_PER_PAGE }} por vista</p>
                                <div class="flex gap-2">
                                    <button (click)="prevPage('admin')" 
                                            [disabled]="adminPage() === 1"
                                            class="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                        Anterior
                                    </button>
                                    <span class="flex items-center px-4 text-[10px] font-black text-slate-800 uppercase tracking-widest">Pág {{ adminPage() }} / {{ totalAdminPages() }}</span>
                                    <button (click)="nextPage('admin')" 
                                            [disabled]="adminPage() === totalAdminPages()"
                                            class="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        }
                    }
                </div>
            }
        </section>

        <!-- Section 2: Regular Users -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest">Usuarios Registrados</h2>
                            <p class="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">{{ regularUsers().length }} usuarios</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 flex-1 justify-end max-w-xl">
                        <!-- User Search -->
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input type="text" 
                                   [ngModel]="userSearchQuery()" 
                                   (ngModelChange)="userSearchQuery.set($event)"
                                   class="block w-full pl-9 pr-3 py-2 border border-gray-100 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white sm:text-xs transition-all shadow-inner" 
                                   placeholder="Buscar usuarios...">
                        </div>

                        <button (click)="openCreateModal('user')" 
                                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 shrink-0">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Usuario
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="p-6">
                @if (isLoading()) {
                    <div class="flex items-center justify-center py-12">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                } @else if (regularUsers().length === 0) {
                    <div class="text-center py-12">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p class="text-gray-500">No hay usuarios registrados</p>
                    </div>
                } @else {
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th class="pb-4 pl-2">Usuario</th>
                                    <th class="pb-4 hidden md:table-cell">Teléfono</th>
                                    <th class="pb-4 hidden lg:table-cell">Fecha</th>
                                    <th class="pb-4 text-right pr-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @for (user of paginatedUsers(); track user.id) {
                                    <tr class="hover:bg-gray-50 transition-colors group">
                                        <td class="py-4 pl-2">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {{ user.name.charAt(0).toUpperCase() }}
                                                </div>
                                                <div>
                                                    <p class="font-medium text-gray-800">{{ user.name }}</p>
                                                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="py-4 hidden md:table-cell">
                                            <span class="text-gray-600">{{ user.phone || '—' }}</span>
                                        </td>
                                        <td class="py-4 hidden lg:table-cell">
                                            <span class="text-gray-500 text-sm">{{ formatDate(user.created_at) }}</span>
                                        </td>
                                        <td class="py-4 pr-2">
                                            <div class="flex items-center justify-end gap-2">
                                                <button (click)="openEditModal(user)" 
                                                        class="p-2 text-slate-700 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                                                        title="Editar Usuario">
                                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button (click)="promoteToAdmin(user)" 
                                                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                                        title="Promover a Administrador">
                                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                    </svg>
                                                    <span class="hidden sm:inline">Admin</span>
                                                </button>
                                                <button (click)="confirmDelete(user)" 
                                                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Eliminar Usuario">
                                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination for Users -->
                    @if (totalUserPages() > 1) {
                        <div class="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                            <p class="text-xs text-gray-500 font-medium">Mostrando {{ USERS_PER_PAGE }} de {{ regularUsers().length }} usuarios</p>
                            <div class="flex gap-2">
                                <button (click)="prevPage('user')" 
                                        [disabled]="userPage() === 1"
                                        class="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    Anterior
                                </button>
                                <span class="flex items-center px-3 text-xs font-black text-slate-700">Pág {{ userPage() }} de {{ totalUserPages() }}</span>
                                <button (click)="nextPage('user')" 
                                        [disabled]="userPage() === totalUserPages()"
                                        class="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    }
                }
            </div>
        </section>
    </div>

    <!-- Edit User Modal -->
    @if (showEditModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeEditModal()">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-enter" (click)="$event.stopPropagation()">
                <div class="px-6 py-5 bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                    <h3 class="text-lg font-bold">Editar Usuario</h3>
                    <p class="text-sm text-slate-300">Modifica la información del usuario en la base de datos</p>
                </div>
                
                <form (ngSubmit)="updateUser()" class="p-6 space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo</label>
                        <input type="text" [(ngModel)]="editUserData.name" name="name" required 
                               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                               placeholder="Ej: Juan Pérez">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Correo Electrónico</label>
                        <input type="email" [(ngModel)]="editUserData.email" name="email" required 
                               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                               placeholder="juan@ejemplo.com">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                        <input type="tel" [(ngModel)]="editUserData.phone" name="phone" 
                               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                               placeholder="+57 300 000 0000">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nueva Contraseña (Opcional)</label>
                        <input type="password" [(ngModel)]="editUserData.password" name="password" minlength="8" 
                               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                               placeholder="Dejar en blanco para no cambiar">
                        <p class="text-xs text-gray-500 mt-1.5">Solo si deseas actualizar la clave de acceso</p>
                    </div>

                    @if (editError()) {
                        <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            {{ editError() }}
                        </div>
                    }

                    <div class="flex gap-3 pt-2">
                        <button type="button" (click)="closeEditModal()" 
                                class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" [disabled]="isUpdating()" 
                                class="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ isUpdating() ? 'Guardando...' : 'Guardar Cambios' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    }
    
    <!-- Create Admin Modal -->
    @if (showCreateModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeCreateModal()">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-enter" (click)="$event.stopPropagation()">
                <div class="px-6 py-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <h3 class="text-lg font-bold">Crear Nuevo {{ createRole() === 'admin' ? 'Administrador' : 'Usuario' }}</h3>
                    <p class="text-sm text-slate-700">{{ createRole() === 'admin' ? 'Los administradores tienen acceso completo al panel' : 'Los usuarios pueden realizar reservas y ver su perfil' }}</p>
                </div>
                
                <form (ngSubmit)="createUser()" class="p-6 space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo</label>
                        <input type="text" [(ngModel)]="newUser.name" name="name" required 
                               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                               placeholder="Ej: Juan Pérez">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Correo Electrónico</label>
                        <input type="email" [(ngModel)]="newUser.email" name="email" required 
                               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                               placeholder="admin@ejemplo.com">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono (Opcional)</label>
                        <input type="tel" [(ngModel)]="newUser.phone" name="phone" 
                               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                               placeholder="+57 300 000 0000">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                        <input type="password" [(ngModel)]="newUser.password" name="password" required minlength="8" 
                               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                               placeholder="Mínimo 8 caracteres">
                        <p class="text-xs text-gray-500 mt-1.5">Mínimo 8 caracteres, incluye números y letras</p>
                    </div>

                    @if (createError()) {
                        <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            {{ createError() }}
                        </div>
                    }

                    <div class="flex gap-3 pt-2">
                        <button type="button" (click)="closeCreateModal()" 
                                class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" [disabled]="isCreating()" 
                                class="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ isCreating() ? 'Creando...' : (createRole() === 'admin' ? 'Crear Admin' : 'Crear Usuario') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    }
    
    <!-- Confirmation Modal -->
    @if (showConfirmModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeConfirmModal()">
            <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-modal-enter" (click)="$event.stopPropagation()">
                <div class="p-6 text-center">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                         [ngClass]="confirmAction() === 'delete' ? 'bg-red-100' : confirmAction() === 'promote' ? 'bg-emerald-100' : 'bg-orange-100'">
                        @if (confirmAction() === 'delete') {
                            <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        } @else if (confirmAction() === 'promote') {
                            <svg class="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        } @else {
                            <svg class="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        }
                    </div>
                    
                    <h3 class="text-lg font-bold text-gray-900 mb-2">{{ confirmTitle() }}</h3>
                    <p class="text-gray-600 text-sm mb-6">{{ confirmMessage() }}</p>
                    
                    <div class="flex gap-3">
                        <button (click)="closeConfirmModal()" 
                                class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button (click)="executeConfirmAction()" [disabled]="isProcessing()"
                                class="flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                                [ngClass]="confirmAction() === 'delete' ? 'bg-red-600 text-white hover:bg-red-700' : 
                                           confirmAction() === 'promote' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 
                                           'bg-orange-600 text-white hover:bg-orange-700'">
                            {{ isProcessing() ? 'Procesando...' : 'Confirmar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    }

    <!-- Toast Notification -->
    @if (toastMessage()) {
        <div class="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div class="px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
                 [ngClass]="toastType() === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'">
                @if (toastType() === 'success') {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                } @else {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                }
                <span class="font-medium">{{ toastMessage() }}</span>
            </div>
        </div>
    }
  `,
    styles: [`
        @keyframes modalEnter {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-enter { animation: modalEnter 0.2s ease-out forwards; }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsersComponent implements OnInit {
    private apiService = inject(ApiService);

    // State
    users = signal<User[]>([]);
    isLoading = signal(true);
    adminSearchQuery = signal('');
    userSearchQuery = signal('');
    createRole = signal<'admin' | 'user'>('admin');

    // Create Modal
    showCreateModal = signal(false);
    isCreating = signal(false);
    createError = signal('');
    newUser = { name: '', email: '', password: '', phone: '' };

    // Edit Modal
    showEditModal = signal(false);
    isUpdating = signal(false);
    editError = signal('');
    editUserData = { name: '', email: '', phone: '', password: '' };

    // Confirmation Modal
    showConfirmModal = signal(false);
    confirmAction = signal<'delete' | 'promote' | 'demote'>('delete');
    confirmTitle = signal('');
    confirmMessage = signal('');
    selectedUser = signal<User | null>(null);
    isProcessing = signal(false);

    // Toast
    toastMessage = signal('');
    toastType = signal<'success' | 'error'>('success');

    // Computed
    currentUser = this.apiService.currentUser;

    adminUsers = computed(() => {
        const query = this.adminSearchQuery().toLowerCase().trim();
        const baseAdmins = this.users().filter(u => u.role === 'admin');
        if (!query) return baseAdmins;
        return baseAdmins.filter(u => 
            u.name.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query) || 
            (u.phone && u.phone.toLowerCase().includes(query))
        );
    });

    regularUsers = computed(() => {
        const query = this.userSearchQuery().toLowerCase().trim();
        const baseUsers = this.users().filter(u => u.role === 'user');
        if (!query) return baseUsers;
        return baseUsers.filter(u => 
            u.name.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query) || 
            (u.phone && u.phone.toLowerCase().includes(query))
        );
    });

    // Pagination & Expansion State
    isAdminExpanded = signal(false);
    adminPage = signal(1);
    userPage = signal(1);
    
    ADMINS_PER_PAGE = 10;
    USERS_PER_PAGE = 25;

    paginatedAdmins = computed(() => {
        const start = (this.adminPage() - 1) * this.ADMINS_PER_PAGE;
        return this.adminUsers().slice(start, start + this.ADMINS_PER_PAGE);
    });

    totalAdminPages = computed(() => Math.ceil(this.adminUsers().length / this.ADMINS_PER_PAGE));

    paginatedUsers = computed(() => {
        const start = (this.userPage() - 1) * this.USERS_PER_PAGE;
        return this.regularUsers().slice(start, start + this.USERS_PER_PAGE);
    });

    totalUserPages = computed(() => Math.ceil(this.regularUsers().length / this.USERS_PER_PAGE));

    constructor() {
        // Reset pages when searching
        effect(() => {
            this.adminSearchQuery();
            this.adminPage.set(1);
        }, { allowSignalWrites: true });

        effect(() => {
            this.userSearchQuery();
            this.userPage.set(1);
        }, { allowSignalWrites: true });
    }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.isLoading.set(true);
        this.apiService.adminGetUsers().subscribe({
            next: (users) => {
                this.users.set(users);
                this.isLoading.set(false);
                // Reset pages if they exceed total pages after reload
                if (this.adminPage() > this.totalAdminPages()) this.adminPage.set(1);
                if (this.userPage() > this.totalUserPages()) this.userPage.set(1);
            },
            error: (err) => {
                console.error('Error loading users:', err);
                this.showToast('Error al cargar usuarios', 'error');
                this.isLoading.set(false);
            }
        });
    }

    // Pagination Methods
    nextPage(type: 'admin' | 'user') {
        if (type === 'admin') {
            if (this.adminPage() < this.totalAdminPages()) {
                this.adminPage.update(p => p + 1);
            }
        } else {
            if (this.userPage() < this.totalUserPages()) {
                this.userPage.update(p => p + 1);
            }
        }
    }

    prevPage(type: 'admin' | 'user') {
        if (type === 'admin') {
            if (this.adminPage() > 1) {
                this.adminPage.update(p => p - 1);
            }
        } else {
            if (this.userPage() > 1) {
                this.userPage.update(p => p - 1);
            }
        }
    }

    isCurrentUser(user: User): boolean {
        return this.currentUser()?.id === user.id;
    }

    formatDate(dateStr: string | undefined): string {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // Create User
    openCreateModal(role: 'admin' | 'user' = 'admin') {
        this.createRole.set(role);
        this.showCreateModal.set(true);
    }

    createUser() {
        if (!this.newUser.name || !this.newUser.email || !this.newUser.password) return;

        this.isCreating.set(true);
        this.createError.set('');

        const userData = { ...this.newUser, role: this.createRole() };

        this.apiService.adminCreateUser(userData).subscribe({
            next: () => {
                this.isCreating.set(false);
                this.closeCreateModal();
                this.showToast(`${this.createRole() === 'admin' ? 'Administrador' : 'Usuario'} creado exitosamente`, 'success');
                this.loadUsers();
            },
            error: (err) => {
                this.isCreating.set(false);
                this.createError.set(err.error?.error || 'Error al crear usuario');
            }
        });
    }

    closeCreateModal() {
        this.showCreateModal.set(false);
        this.newUser = { name: '', email: '', password: '', phone: '' };
        this.createError.set('');
    }

    // Edit User
    openEditModal(user: User) {
        this.selectedUser.set(user);
        this.editUserData = {
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '' // Opcional
        };
        this.editError.set('');
        this.showEditModal.set(true);
    }

    closeEditModal() {
        this.showEditModal.set(false);
        this.selectedUser.set(null);
        this.editError.set('');
    }

    updateUser() {
        const user = this.selectedUser();
        if (!user) return;

        this.isUpdating.set(true);
        this.editError.set('');

        // Limpiar contraseña si está vacía para no sobrescribir con string vacío
        const data = { ...this.editUserData };
        if (!data.password) {
            const { password, ...rest } = data;
            Object.assign(data, rest);
            delete (data as any).password;
        }

        this.apiService.adminUpdateUser(user.id, data).subscribe({
            next: () => {
                this.isUpdating.set(false);
                this.closeEditModal();
                this.showToast('Usuario actualizado exitosamente', 'success');
                this.loadUsers();
            },
            error: (err) => {
                this.isUpdating.set(false);
                this.editError.set(err.error?.error || 'Error al actualizar usuario');
            }
        });
    }

    // Promote to Admin
    promoteToAdmin(user: User) {
        this.selectedUser.set(user);
        this.confirmAction.set('promote');
        this.confirmTitle.set('Promover a Administrador');
        this.confirmMessage.set(`¿Estás seguro de que deseas darle permisos de administrador a ${user.name}?`);
        this.showConfirmModal.set(true);
    }

    // Demote to User
    demoteToUser(user: User) {
        this.selectedUser.set(user);
        this.confirmAction.set('demote');
        this.confirmTitle.set('Quitar rol de Admin');
        this.confirmMessage.set(`¿Estás seguro de que deseas quitarle los permisos de administrador a ${user.name}?`);
        this.showConfirmModal.set(true);
    }

    // Delete User
    confirmDelete(user: User) {
        this.selectedUser.set(user);
        this.confirmAction.set('delete');
        this.confirmTitle.set('Eliminar Usuario');
        this.confirmMessage.set(`¿Estás seguro de que deseas eliminar a ${user.name}? Esta acción no se puede deshacer.`);
        this.showConfirmModal.set(true);
    }

    closeConfirmModal() {
        this.showConfirmModal.set(false);
        this.selectedUser.set(null);
    }

    executeConfirmAction() {
        const user = this.selectedUser();
        if (!user) return;

        this.isProcessing.set(true);

        if (this.confirmAction() === 'delete') {
            this.apiService.adminDeleteUser(user.id).subscribe({
                next: () => {
                    this.isProcessing.set(false);
                    this.closeConfirmModal();
                    this.showToast('Usuario eliminado', 'success');
                    this.loadUsers();
                },
                error: (err) => {
                    this.isProcessing.set(false);
                    this.showToast(err.error?.error || 'Error al eliminar', 'error');
                }
            });
        } else if (this.confirmAction() === 'promote') {
            this.apiService.adminUpdateUserRole(user.id, 'admin').subscribe({
                next: () => {
                    this.isProcessing.set(false);
                    this.closeConfirmModal();
                    this.showToast(`${user.name} ahora es administrador`, 'success');
                    this.loadUsers();
                },
                error: (err) => {
                    this.isProcessing.set(false);
                    this.showToast(err.error?.error || 'Error al cambiar rol', 'error');
                }
            });
        } else if (this.confirmAction() === 'demote') {
            this.apiService.adminUpdateUserRole(user.id, 'user').subscribe({
                next: () => {
                    this.isProcessing.set(false);
                    this.closeConfirmModal();
                    this.showToast(`${user.name} ya no es administrador`, 'success');
                    this.loadUsers();
                },
                error: (err) => {
                    this.isProcessing.set(false);
                    this.showToast(err.error?.error || 'Error al cambiar rol', 'error');
                }
            });
        }
    }

    showToast(message: string, type: 'success' | 'error') {
        this.toastMessage.set(message);
        this.toastType.set(type);
        setTimeout(() => this.toastMessage.set(''), 4000);
    }
}
