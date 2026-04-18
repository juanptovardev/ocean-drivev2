import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-contrato',
    standalone: true,
    template: `
    <div class="min-h-screen flex items-center justify-center bg-[#FBFBFD]">
      <div class="text-center animate-fade-in">
        <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#002B5B]/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#002B5B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[#002B5B] mb-2">Descargando contrato...</h1>
        <p class="text-gray-400 text-sm">Tu archivo se descargará automáticamente</p>
      </div>
    </div>
  `,
    styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease forwards;
    }
  `],
})
export class ContratoComponent implements OnInit {
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            const link = document.createElement('a');
            link.href = 'assets/Contrato.pdf';
            link.download = 'Contrato_Ocean_Drive.pdf';
            link.click();

            // Redirect to politicas after a short delay
            setTimeout(() => {
                this.router.navigate(['/politicas']);
            }, 2000);
        }
    }
}
