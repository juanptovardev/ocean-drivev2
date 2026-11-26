import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { ApiService } from '../../../services/api.service';
import { BookingService } from '../../../services/booking.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from '../../../components/calendar/calendar.component';
import { CurrencyService } from '../../../services/currency.service';
import { LanguageService } from '../../../services/language.service';

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: Country[] = [
  { name: 'Afganistán', code: 'AF', flag: '🇦🇫', dialCode: '+93' },
  { name: 'Albania', code: 'AL', flag: '🇦🇱', dialCode: '+355' },
  { name: 'Alemania', code: 'DE', flag: '🇩🇪', dialCode: '+49' },
  { name: 'Andorra', code: 'AD', flag: '🇦🇩', dialCode: '+376' },
  { name: 'Angola', code: 'AO', flag: '🇦🇴', dialCode: '+244' },
  { name: 'Antigua y Barbuda', code: 'AG', flag: '🇦🇬', dialCode: '+1' },
  { name: 'Arabia Saudita', code: 'SA', flag: '🇸🇦', dialCode: '+966' },
  { name: 'Argelia', code: 'DZ', flag: '🇩🇿', dialCode: '+213' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷', dialCode: '+54' },
  { name: 'Armenia', code: 'AM', flag: '🇦🇲', dialCode: '+374' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', dialCode: '+61' },
  { name: 'Austria', code: 'AT', flag: '🇦🇹', dialCode: '+43' },
  { name: 'Azerbaiyán', code: 'AZ', flag: '🇦🇿', dialCode: '+994' },
  { name: 'Bahamas', code: 'BS', flag: '🇧🇸', dialCode: '+1' },
  { name: 'Bangladés', code: 'BD', flag: '🇧🇩', dialCode: '+880' },
  { name: 'Barbados', code: 'BB', flag: '🇧🇧', dialCode: '+1' },
  { name: 'Baréin', code: 'BH', flag: '🇧🇭', dialCode: '+973' },
  { name: 'Bélgica', code: 'BE', flag: '🇧🇪', dialCode: '+32' },
  { name: 'Belice', code: 'BZ', flag: '🇧🇿', dialCode: '+501' },
  { name: 'Benín', code: 'BJ', flag: '🇧🇯', dialCode: '+229' },
  { name: 'Bielorrusia', code: 'BY', flag: '🇧🇾', dialCode: '+375' },
  { name: 'Birmania', code: 'MM', flag: '🇲🇲', dialCode: '+95' },
  { name: 'Bolivia', code: 'BO', flag: '🇧🇴', dialCode: '+591' },
  { name: 'Bosnia y Herzegovina', code: 'BA', flag: '🇧🇦', dialCode: '+387' },
  { name: 'Botsuana', code: 'BW', flag: '🇧🇼', dialCode: '+267' },
  { name: 'Brasil', code: 'BR', flag: '🇧🇷', dialCode: '+55' },
  { name: 'Brunéi', code: 'BN', flag: '🇧🇳', dialCode: '+673' },
  { name: 'Bulgaria', code: 'BG', flag: '🇧🇬', dialCode: '+359' },
  { name: 'Burkina Faso', code: 'BF', flag: '🇧🇫', dialCode: '+226' },
  { name: 'Burundi', code: 'BI', flag: '🇧🇮', dialCode: '+257' },
  { name: 'Bután', code: 'BT', flag: '🇧🇹', dialCode: '+975' },
  { name: 'Cabo Verde', code: 'CV', flag: '🇨🇻', dialCode: '+238' },
  { name: 'Camboya', code: 'KH', flag: '🇰🇭', dialCode: '+855' },
  { name: 'Camerún', code: 'CM', flag: '🇨🇲', dialCode: '+237' },
  { name: 'Canadá', code: 'CA', flag: '🇨🇦', dialCode: '+1' },
  { name: 'Catar', code: 'QA', flag: '🇶🇦', dialCode: '+974' },
  { name: 'Chad', code: 'TD', flag: '🇹🇩', dialCode: '+235' },
  { name: 'Chile', code: 'CL', flag: '🇨🇱', dialCode: '+56' },
  { name: 'China', code: 'CN', flag: '🇨🇳', dialCode: '+86' },
  { name: 'Chipre', code: 'CY', flag: '🇨🇾', dialCode: '+357' },
  { name: 'Ciudad del Vaticano', code: 'VA', flag: '🇻🇦', dialCode: '+39' },
  { name: 'Colombia', code: 'CO', flag: '🇨🇴', dialCode: '+57' },
  { name: 'Comoras', code: 'KM', flag: '🇰🇲', dialCode: '+269' },
  { name: 'Corea del Norte', code: 'KP', flag: '🇰🇵', dialCode: '+850' },
  { name: 'Corea del Sur', code: 'KR', flag: '🇰🇷', dialCode: '+82' },
  { name: 'Costa de Marfil', code: 'CI', flag: '🇨🇮', dialCode: '+225' },
  { name: 'Costa Rica', code: 'CR', flag: '🇨🇷', dialCode: '+506' },
  { name: 'Croacia', code: 'HR', flag: '🇭🇷', dialCode: '+385' },
  { name: 'Cuba', code: 'CU', flag: '🇨🇺', dialCode: '+53' },
  { name: 'Dinamarca', code: 'DK', flag: '🇩🇰', dialCode: '+45' },
  { name: 'Dominica', code: 'DM', flag: '🇩🇲', dialCode: '+1' },
  { name: 'Ecuador', code: 'EC', flag: '🇪🇨', dialCode: '+593' },
  { name: 'Egipto', code: 'EG', flag: '🇪🇬', dialCode: '+20' },
  { name: 'El Salvador', code: 'SV', flag: '🇸🇻', dialCode: '+503' },
  { name: 'Emiratos Árabes Unidos', code: 'AE', flag: '🇦🇪', dialCode: '+971' },
  { name: 'Eritrea', code: 'ER', flag: '🇪🇷', dialCode: '+291' },
  { name: 'Eslovaquia', code: 'SK', flag: '🇸🇰', dialCode: '+421' },
  { name: 'Eslovenia', code: 'SI', flag: '🇸🇮', dialCode: '+386' },
  { name: 'España', code: 'ES', flag: '🇪🇸', dialCode: '+34' },
  { name: 'Estados Unidos', code: 'US', flag: '🇺🇸', dialCode: '+1' },
  { name: 'Estonia', code: 'EE', flag: '🇪🇪', dialCode: '+372' },
  { name: 'Etiopía', code: 'ET', flag: '🇪🇹', dialCode: '+251' },
  { name: 'Filipinas', code: 'PH', flag: '🇵🇭', dialCode: '+63' },
  { name: 'Finlandia', code: 'FI', flag: '🇫🇮', dialCode: '+358' },
  { name: 'Fiyi', code: 'FJ', flag: '🇫🇯', dialCode: '+679' },
  { name: 'Francia', code: 'FR', flag: '🇫🇷', dialCode: '+33' },
  { name: 'Gabón', code: 'GA', flag: '🇬🇦', dialCode: '+241' },
  { name: 'Gambia', code: 'GM', flag: '🇬🇲', dialCode: '+220' },
  { name: 'Georgia', code: 'GE', flag: '🇬🇪', dialCode: '+995' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', dialCode: '+233' },
  { name: 'Granada', code: 'GD', flag: '🇬🇩', dialCode: '+1' },
  { name: 'Grecia', code: 'GR', flag: '🇬🇷', dialCode: '+30' },
  { name: 'Guatemala', code: 'GT', flag: '🇬🇹', dialCode: '+502' },
  { name: 'Guyana', code: 'GY', flag: '🇬🇾', dialCode: '+592' },
  { name: 'Guinea', code: 'GN', flag: '🇬🇳', dialCode: '+224' },
  { name: 'Guinea-Bisáu', code: 'GW', flag: '🇬🇼', dialCode: '+245' },
  { name: 'Guinea Ecuatorial', code: 'GQ', flag: '🇬🇶', dialCode: '+240' },
  { name: 'Haití', code: 'HT', flag: '🇭🇹', dialCode: '+509' },
  { name: 'Honduras', code: 'HN', flag: '🇭🇳', dialCode: '+504' },
  { name: 'Hungría', code: 'HU', flag: '🇭🇺', dialCode: '+36' },
  { name: 'India', code: 'IN', flag: '🇮🇳', dialCode: '+91' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', dialCode: '+62' },
  { name: 'Irak', code: 'IQ', flag: '🇮🇶', dialCode: '+964' },
  { name: 'Irán', code: 'IR', flag: '🇮🇷', dialCode: '+98' },
  { name: 'Irlanda', code: 'IE', flag: '🇮🇪', dialCode: '+353' },
  { name: 'Islandia', code: 'IS', flag: '🇮🇸', dialCode: '+354' },
  { name: 'Islas Marshall', code: 'MH', flag: '🇲🇭', dialCode: '+692' },
  { name: 'Islas Salomón', code: 'SB', flag: '🇸🇧', dialCode: '+677' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱', dialCode: '+972' },
  { name: 'Italia', code: 'IT', flag: '🇮🇹', dialCode: '+39' },
  { name: 'Jamaica', code: 'JM', flag: '🇯🇲', dialCode: '+1' },
  { name: 'Japón', code: 'JP', flag: '🇯🇵', dialCode: '+81' },
  { name: 'Jordania', code: 'JO', flag: '🇯🇴', dialCode: '+962' },
  { name: 'Kazajistán', code: 'KZ', flag: '🇰🇿', dialCode: '+7' },
  { name: 'Kenia', code: 'KE', flag: '🇰🇪', dialCode: '+254' },
  { name: 'Kirguistán', code: 'KG', flag: '🇰🇬', dialCode: '+996' },
  { name: 'Kiribati', code: 'KI', flag: '🇰🇮', dialCode: '+686' },
  { name: 'Kuwait', code: 'KW', flag: '🇰🇼', dialCode: '+965' },
  { name: 'Laos', code: 'LA', flag: '🇱🇦', dialCode: '+856' },
  { name: 'Lesoto', code: 'LS', flag: '🇱🇸', dialCode: '+266' },
  { name: 'Letonia', code: 'LV', flag: '🇱🇻', dialCode: '+371' },
  { name: 'Líbano', code: 'LB', flag: '🇱🇧', dialCode: '+961' },
  { name: 'Liberia', code: 'LR', flag: '🇱🇷', dialCode: '+231' },
  { name: 'Libia', code: 'LY', flag: '🇱🇾', dialCode: '+218' },
  { name: 'Liechtenstein', code: 'LI', flag: '🇱🇮', dialCode: '+423' },
  { name: 'Lituania', code: 'LT', flag: '🇱🇹', dialCode: '+370' },
  { name: 'Luxemburgo', code: 'LU', flag: '🇱🇺', dialCode: '+352' },
  { name: 'Madagascar', code: 'MG', flag: '🇲🇬', dialCode: '+261' },
  { name: 'Malasia', code: 'MY', flag: '🇲🇾', dialCode: '+60' },
  { name: 'Malaui', code: 'MW', flag: '🇲🇼', dialCode: '+265' },
  { name: 'Maldivas', code: 'MV', flag: '🇲🇻', dialCode: '+960' },
  { name: 'Malí', code: 'ML', flag: '🇲🇱', dialCode: '+223' },
  { name: 'Malta', code: 'MT', flag: '🇲🇹', dialCode: '+356' },
  { name: 'Marruecos', code: 'MA', flag: '🇲🇦', dialCode: '+212' },
  { name: 'Mauricio', code: 'MU', flag: '🇲🇺', dialCode: '+230' },
  { name: 'Mauritania', code: 'MR', flag: '🇲🇷', dialCode: '+222' },
  { name: 'México', code: 'MX', flag: '🇲🇽', dialCode: '+52' },
  { name: 'Micronesia', code: 'FM', flag: '🇫🇲', dialCode: '+691' },
  { name: 'Moldavia', code: 'MD', flag: '🇲🇩', dialCode: '+373' },
  { name: 'Mónaco', code: 'MC', flag: '🇲🇨', dialCode: '+377' },
  { name: 'Mongolia', code: 'MN', flag: '🇲🇳', dialCode: '+976' },
  { name: 'Montenegro', code: 'ME', flag: '🇲🇪', dialCode: '+382' },
  { name: 'Mozambique', code: 'MZ', flag: '🇲🇿', dialCode: '+258' },
  { name: 'Namibia', code: 'NA', flag: '🇳🇦', dialCode: '+264' },
  { name: 'Nauru', code: 'NR', flag: '🇳🇷', dialCode: '+674' },
  { name: 'Nepal', code: 'NP', flag: '🇳🇵', dialCode: '+977' },
  { name: 'Nicaragua', code: 'NI', flag: '🇳🇮', dialCode: '+505' },
  { name: 'Níger', code: 'NE', flag: '🇳🇪', dialCode: '+227' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', dialCode: '+234' },
  { name: 'Noruega', code: 'NO', flag: '🇳🇴', dialCode: '+47' },
  { name: 'Nueva Zelanda', code: 'NZ', flag: '🇳🇿', dialCode: '+64' },
  { name: 'Omán', code: 'OM', flag: '🇴🇲', dialCode: '+968' },
  { name: 'Países Bajos', code: 'NL', flag: '🇳🇱', dialCode: '+31' },
  { name: 'Pakistán', code: 'PK', flag: '🇵🇰', dialCode: '+92' },
  { name: 'Palaos', code: 'PW', flag: '🇵🇼', dialCode: '+680' },
  { name: 'Panamá', code: 'PA', flag: '🇵🇦', dialCode: '+507' },
  { name: 'Papúa Nueva Guinea', code: 'PG', flag: '🇵🇬', dialCode: '+675' },
  { name: 'Paraguay', code: 'PY', flag: '🇵🇾', dialCode: '+595' },
  { name: 'Perú', code: 'PE', flag: '🇵🇪', dialCode: '+51' },
  { name: 'Polonia', code: 'PL', flag: '🇵🇱', dialCode: '+48' },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹', dialCode: '+351' },
  { name: 'Reino Unido', code: 'GB', flag: '🇬🇧', dialCode: '+44' },
  { name: 'República Centroafricana', code: 'CF', flag: '🇨🇫', dialCode: '+236' },
  { name: 'República Checa', code: 'CZ', flag: '🇨🇿', dialCode: '+420' },
  { name: 'República del Congo', code: 'CG', flag: '🇨🇬', dialCode: '+242' },
  { name: 'República Democrática del Congo', code: 'CD', flag: '🇨🇩', dialCode: '+243' },
  { name: 'República Dominicana', code: 'DO', flag: '🇩🇴', dialCode: '+1' },
  { name: 'Ruanda', code: 'RW', flag: '🇷🇼', dialCode: '+250' },
  { name: 'Rumania', code: 'RO', flag: '🇷🇴', dialCode: '+40' },
  { name: 'Rusia', code: 'RU', flag: '🇷🇺', dialCode: '+7' },
  { name: 'Samoa', code: 'WS', flag: '🇼🇸', dialCode: '+685' },
  { name: 'San Cristóbal y Nieves', code: 'KN', flag: '🇰🇳', dialCode: '+1' },
  { name: 'San Marino', code: 'SM', flag: '🇸🇲', dialCode: '+378' },
  { name: 'San Vicente y las Granadinas', code: 'VC', flag: '🇻🇨', dialCode: '+1' },
  { name: 'Santa Lucía', code: 'LC', flag: '🇱🇨', dialCode: '+1' },
  { name: 'Santo Tomé y Príncipe', code: 'ST', flag: '🇸🇹', dialCode: '+239' },
  { name: 'Senegal', code: 'SN', flag: '🇸🇳', dialCode: '+221' },
  { name: 'Serbia', code: 'RS', flag: '🇷🇸', dialCode: '+381' },
  { name: 'Seychelles', code: 'SC', flag: '🇸🇨', dialCode: '+248' },
  { name: 'Sierra Leona', code: 'SL', flag: '🇸🇱', dialCode: '+232' },
  { name: 'Singapur', code: 'SG', flag: '🇸🇬', dialCode: '+65' },
  { name: 'Siria', code: 'SY', flag: '🇸🇾', dialCode: '+963' },
  { name: 'Somalia', code: 'SO', flag: '🇸🇴', dialCode: '+252' },
  { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', dialCode: '+94' },
  { name: 'Suazilandia', code: 'SZ', flag: '🇸🇿', dialCode: '+268' },
  { name: 'Sudáfrica', code: 'ZA', flag: '🇿🇦', dialCode: '+27' },
  { name: 'Sudán', code: 'SD', flag: '🇸🇩', dialCode: '+249' },
  { name: 'Sudán del Sur', code: 'SS', flag: '🇸🇸', dialCode: '+211' },
  { name: 'Suecia', code: 'SE', flag: '🇸🇪', dialCode: '+46' },
  { name: 'Suiza', code: 'CH', flag: '🇨🇭', dialCode: '+41' },
  { name: 'Surinam', code: 'SR', flag: '🇸🇷', dialCode: '+597' },
  { name: 'Tailandia', code: 'TH', flag: '🇹🇭', dialCode: '+66' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', dialCode: '+255' },
  { name: 'Tayikistán', code: 'TJ', flag: '🇹🇯', dialCode: '+992' },
  { name: 'Timor Oriental', code: 'TL', flag: '🇹🇱', dialCode: '+670' },
  { name: 'Togo', code: 'TG', flag: '🇹🇬', dialCode: '+228' },
  { name: 'Tonga', code: 'TO', flag: '🇹🇴', dialCode: '+676' },
  { name: 'Trinidad y Tobago', code: 'TT', flag: '🇹🇹', dialCode: '+1' },
  { name: 'Túnez', code: 'TN', flag: '🇹🇳', dialCode: '+216' },
  { name: 'Turkmenistán', code: 'TM', flag: '🇹🇲', dialCode: '+993' },
  { name: 'Turquía', code: 'TR', flag: '🇹🇷', dialCode: '+90' },
  { name: 'Tuvalu', code: 'TV', flag: '🇹🇻', dialCode: '+688' },
  { name: 'Ucrania', code: 'UA', flag: '🇺🇦', dialCode: '+380' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬', dialCode: '+256' },
  { name: 'Uruguay', code: 'UY', flag: '🇺🇾', dialCode: '+598' },
  { name: 'Uzbekistán', code: 'UZ', flag: '🇺🇿', dialCode: '+998' },
  { name: 'Vanuatu', code: 'VU', flag: '🇻🇺', dialCode: '+678' },
  { name: 'Venezuela', code: 'VE', flag: '🇻🇪', dialCode: '+58' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳', dialCode: '+84' },
  { name: 'Yemen', code: 'YE', flag: '🇾🇪', dialCode: '+967' },
  { name: 'Yibuti', code: 'DJ', flag: '🇩🇯', dialCode: '+253' },
  { name: 'Zambia', code: 'ZM', flag: '🇿🇲', dialCode: '+260' },
  { name: 'Zimbabue', code: 'ZW', flag: '🇿🇼', dialCode: '+263' }
];

@Component({
  selector: 'app-reservas',
  standalone: true,
  template: `
    <div class="min-h-screen bg-[#FBFBFD] flex flex-col">
      <app-header variant="white" class="relative z-50"></app-header>
      
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12 animate-in fade-in duration-700">
        
        <!-- Header Section -->
        <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 class="text-3xl md:text-5xl font-black text-[#002B5B] uppercase tracking-tighter italic">
                    {{ lang.t('reservas.title') }}
                </h1>
                <p class="text-gray-500 font-medium mt-2">{{ lang.t('reservas.subtitle') }}</p>
            </div>
            
            <!-- Filter Tabs -->
            <div class="flex p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
                <button (click)="currentTab.set('active')" 
                        class="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg transition-all"
                        [class.bg-[#002B5B]]="currentTab() === 'active'"
                        [class.text-white]="currentTab() === 'active'"
                        [class.text-gray-400]="currentTab() !== 'active'"
                        [class.hover:bg-gray-50]="currentTab() !== 'active'">
                    {{ lang.t('reservas.tabs.active') }}
                </button>
                <button (click)="currentTab.set('future')" 
                        class="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg transition-all"
                        [class.bg-[#002B5B]]="currentTab() === 'future'"
                        [class.text-white]="currentTab() === 'future'"
                        [class.text-gray-400]="currentTab() !== 'future'"
                        [class.hover:bg-gray-50]="currentTab() !== 'future'">
                    {{ lang.t('reservas.tabs.future') }}
                </button>
                <button (click)="currentTab.set('past')" 
                        class="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg transition-all"
                        [class.bg-[#002B5B]]="currentTab() === 'past'"
                        [class.text-white]="currentTab() === 'past'"
                        [class.text-gray-400]="currentTab() !== 'past'"
                        [class.hover:bg-gray-50]="currentTab() !== 'past'">
                    {{ lang.t('reservas.tabs.past') }}
                </button>
            </div>
        </div>

        <!-- Content -->
        @if (isLoading()) {
            <div class="w-full py-20 flex items-center justify-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6F61]"></div>
            </div>
        } @else {
            
            <!-- List -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" *ngIf="currentList().length > 0; else noData">
                @for (booking of currentList(); track booking.id) {
                    <div class="bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-gray-100 transition-all group overflow-hidden relative"
                         [class.hover:border-green-500]="isProcessing(booking)"
                         [class.hover:border-blue-900]="isFuture(booking) || isPast(booking)"
                         [class.hover:border-red-500]="isCancelled(booking)">
                        <!-- Status Badge -->
                        <div class="absolute top-6 right-6">
                            <span class="px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest"
                                  [class.bg-green-100]="isProcessing(booking)"
                                  [class.text-green-600]="isProcessing(booking)"
                                  [class.bg-blue-50]="isFuture(booking)"
                                  [class.text-[#002B5B]]="isFuture(booking)"
                                  [class.bg-gray-100]="isPast(booking)"
                                  [class.text-gray-500]="isPast(booking)"
                                  [class.bg-red-50]="isCancelled(booking)"
                                  [class.text-red-500]="isCancelled(booking)">
                                @if(isProcessing(booking)) { {{ lang.t('reservas.status.processing') }} }
                                @else if(isFuture(booking)) { {{ lang.t('reservas.status.confirmed') }} }
                                @else if(isCancelled(booking)) { {{ lang.t('reservas.status.cancelled') }} }
                                @else { {{ lang.t('reservas.status.finished') }} }
                            </span>
                        </div>

                        <div class="flex flex-col md:flex-row gap-6">
                            <!-- Image -->
                            <div class="w-full md:w-1/3 aspect-[4/3] bg-gray-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                <img [src]="booking.image_url || 'assets/images/placeholder-car.png'" 
                                     class="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                                     alt="Vehículo"
                                     onError="this.src='https://placehold.co/400x300?text=Auto'">
                            </div>
                            
                            <!-- Info -->
                            <div class="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 class="text-xl font-black text-[#002B5B] uppercase italic mb-1">{{ booking.category_name }}</h3>
                                    <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">{{ lang.t('reservas.ref') }} #{{ booking.code }}</p>

                                    <!-- Dates -->
                                    <div class="flex items-center gap-4 mb-4">
                                        @if (!isCancelled(booking)) {
                                            <div>
                                                <p class="text-[0.6rem] text-gray-400 font-bold uppercase">{{ lang.t('reservas.pickup') }}</p>
                                                <p class="text-[#002B5B] font-bold text-sm">{{ formatDateShort(booking.start_date) }}</p>
                                                <p class="text-xs text-gray-400 font-medium">{{ formatTimeOnly(booking.pickup_time) }}</p>
                                            </div>
                                            <div class="h-8 w-px bg-gray-100"></div>
                                        }
                                        <div>
                                            <p class="text-[0.6rem] text-gray-400 font-bold uppercase">
                                                {{ isCancelled(booking) ? lang.t('reservas.status.cancelled_label') : lang.t('reservas.dropoff') }}
                                            </p>
                                            <p class="text-[#002B5B] font-bold text-sm">{{ formatDateShort(booking.end_date) }}</p>
                                            <p class="text-xs text-gray-400 font-medium">{{ formatTimeOnly(booking.dropoff_time) }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-end justify-between border-t border-gray-50 pt-4">
                                    <div>
                                        <p class="text-[0.6rem] text-gray-400 font-bold uppercase">{{ lang.t('reservas.total') }}</p>
                                        <p class="text-[#FF6F61] font-black text-xl leading-none">{{ currencyService.formatPrice(booking.total_price) }}</p>
                                    </div>
                                    
                                    <button (click)="openModal(booking)" class="px-4 py-2 bg-slate-100 hover:bg-[#002B5B] hover:text-white rounded-lg text-xs font-bold text-[#002B5B] transition-all uppercase tracking-wide">
                                        {{ isCancelled(booking) ? lang.t('reservas.details') : lang.t('reservas.manage') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>

            <ng-template #noData>
                <div class="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <h3 class="text-xl font-bold text-[#002B5B] mb-2">{{ lang.t('reservas.empty.title') }} {{ tabName() }}</h3>
                    <p class="text-sm text-gray-400 max-w-xs mx-auto mb-6">{{ lang.t('reservas.empty.desc') }}</p>
                    <a routerLink="/" class="px-6 py-2 bg-[#002B5B] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FF6F61] transition-colors">
                        {{ lang.t('reservas.empty.action') }}
                    </a>
                </div>
            </ng-template>

        }

        <!-- MODAL DETALLES -->
        @if (selectedBooking()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in" (click)="closeModal()">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
                    
                    <!-- Header -->
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                        <div class="flex flex-col">
                            <h2 class="text-xl md:text-2xl font-black text-[#002B5B] uppercase tracking-tight italic">{{ selectedBooking().category_name }}</h2>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ lang.t('reservas.ref') }} #{{ selectedBooking().code }}</p>
                        </div>
                        <button aria-label="Cerrar" (click)="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-6 overflow-y-auto custom-scrollbar">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <!-- 1. Status & Info -->
                            <div class="col-span-1 md:col-span-2 flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div class="flex-1">
                                    <p class="text-[10px] font-bold text-slate-400 uppercase">{{ lang.t('reservas.modal.status') }}</p>
                                    <span class="inline-block mt-1 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider"
                                          [ngClass]="{
                                              'bg-blue-100 text-blue-700': isProcessing(selectedBooking()),
                                              'bg-green-100 text-green-700': isFuture(selectedBooking()),
                                              'bg-slate-200 text-slate-600': isPast(selectedBooking()),
                                              'bg-red-50 text-red-500': isCancelled(selectedBooking())
                                          }">
                                          @if(isProcessing(selectedBooking())) { {{ lang.t('reservas.status.processing') }} }
                                          @else if(isFuture(selectedBooking())) { {{ lang.t('reservas.status.confirmed') }} }
                                          @else if(isCancelled(selectedBooking())) { {{ lang.t('reservas.status.cancelled') }} }
                                          @else { {{ lang.t('reservas.status.finished') }} }
                                    </span>
                                </div>
                                <div class="text-right">
                                    <p class="text-[10px] font-bold text-slate-400 uppercase">{{ lang.t('reservas.total') }}</p>
                                    <p class="text-2xl font-black text-[#FF6F61]">{{ currencyService.formatPrice(selectedBooking().total_price) }}</p>
                                </div>
                            </div>

                            <!-- 2. Logistics -->
                            <div class="space-y-4">
                                <h3 class="text-xs font-black text-[#002B5B] uppercase tracking-widest border-b border-slate-100 pb-2">{{ lang.t('reservas.modal.pickup') }}</h3>
                                <div class="pl-2 border-l-2 border-green-500">
                                    <p class="text-sm font-bold text-slate-800">{{ formatDateFull(selectedBooking().start_date) }}</p>
                                    <p class="text-xs text-slate-600">{{ formatTimeOnly(selectedBooking().pickup_time) }}</p>
                                    <div class="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {{ selectedBooking().pickup_location }}
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <h3 class="text-xs font-black text-[#002B5B] uppercase tracking-widest border-b border-slate-100 pb-2">{{ lang.t('reservas.modal.dropoff') }}</h3>
                                <div class="pl-2 border-l-2 border-red-500">
                                    <p class="text-sm font-bold text-slate-800">
                                        {{ isCancelled(selectedBooking()) ? getOriginalDropoffData(selectedBooking()).date : formatDateFull(selectedBooking().end_date) }}
                                    </p>
                                    <p class="text-xs text-slate-600">
                                        {{ isCancelled(selectedBooking()) ? getOriginalDropoffData(selectedBooking()).time : formatTimeOnly(selectedBooking().dropoff_time) }}
                                    </p>
                                    <div class="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {{ selectedBooking().dropoff_location }}
                                    </div>
                                </div>
                            </div>

                            <!-- 3. Vehicle & Extras -->
                            <div class="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                                <h3 class="text-xs font-black text-[#002B5B] uppercase tracking-widest mb-3">{{ lang.t('reservas.modal.vehicle') }}</h3>
                                <div class="flex items-start gap-4">
                                    <div class="w-16 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                                        <img [src]="selectedBooking().image_url" class="w-full h-full object-cover mix-blend-multiply" alt="Auto">
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-slate-800">{{ selectedBooking().category_name }}</p>
                                        <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{{ lang.t('reservas.plate') }}: {{ selectedBooking().plate || lang.t('reservas.pending') }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer Actions -->
                    <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 justify-end shrink-0">
                        @if (!isPast(selectedBooking()) && !isProcessing(selectedBooking()) && !isCancelled(selectedBooking())) {
                             <button (click)="cancelBooking(selectedBooking())" 
                                     class="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
                                 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 {{ lang.t('reservas.cancel') }}
                             </button>
                             
                             <button (click)="editBooking(selectedBooking())" 
                                     class="px-5 py-2.5 rounded-xl bg-[#002B5B] text-white hover:bg-[#003875] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20">
                                 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                 {{ lang.t('reservas.modify') }}
                             </button>
                        } @else {
                            <div class="w-full flex flex-col items-center gap-3">
                                <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 w-full text-center">
                                    <p class="text-xs font-bold text-[#002B5B] mb-1">
                                        Reserva {{ isCancelled(selectedBooking()) ? lang.t('reservas.status.cancelled_label') : (isPast(selectedBooking()) ? lang.t('reservas.status.completed_label') : lang.t('reservas.status.processing_label')) }}
                                    </p>
                                    @if(isCancelled(selectedBooking())) {
                                        <div class="mt-2 text-[10px] font-medium">
                                            <p class="text-red-500">{{ getCancellationInfo(selectedBooking()).actor }}</p>
                                            @if(getCancellationInfo(selectedBooking()).dateTime) {
                                                <p class="text-slate-500 mt-0.5">{{ getCancellationInfo(selectedBooking()).dateTime }}</p>
                                            }
                                        </div>
                                    } @else {
                                        <p class="text-[10px] text-slate-500">{{ lang.t('reservas.support_msg') }}</p>
                                    }
                                </div>
                                @if(!isCancelled(selectedBooking())) {
                                    <button (click)="contactSupport()" class="w-full px-5 py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                        {{ lang.t('reservas.contact') }}
                                    </button>
                                }
                                <button (click)="closeModal()" class="w-full px-6 py-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider transition-colors">
                                    {{ lang.t('reservas.close') }}
                                </button>
                             </div>
                        }
                    </div>
                </div>
            </div>
        }

        <!-- MODAL EDICION -->
        @if (isEditing()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in text-left" (click)="closeEditModal()">
                <div class="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
                    <div class="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 transition-all">
                        <h2 class="text-xl font-bold text-[#002B5B]">{{ lang.t('reservas.edit.title') }}</h2>
                        <button aria-label="Cerrar" (click)="closeEditModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div class="p-6 space-y-8">
                        
                        <!-- Contact Section -->
                        <section>
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {{ lang.t('reservas.edit.contact') }}
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-[#002B5B] mb-1.5 uppercase ml-1">{{ lang.t('reservas.edit.phone') }}</label>
                                    <div class="flex gap-2">
                                        <div class="relative w-24 shrink-0 z-50">
                                            <!-- Custom DDI Dropdown -->
                                            <div class="relative">
                                                <button type="button" 
                                                        (click)="showManualDDI.set(!showManualDDI())"
                                                        class="w-full h-11 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left flex items-center justify-between">
                                                    <span>{{ editForm().phone_code || '+57' }}</span>
                                                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                </button>

                                                @if(showManualDDI()) {
                                                    <div class="absolute top-12 left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                                        <div class="relative mb-2">
                                                            <input type="text"
                                                                   [ngModel]="ddiSearch()"
                                                                   (ngModelChange)="filterDDI($event)"
                                                                   placeholder="Buscar país..."
                                                                   class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                                            <svg class="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                        </div>
                                                        <div class="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                                            @for(country of filteredDDI(); track country.code) {
                                                                <button type="button"
                                                                        (click)="selectManualDDI(country)"
                                                                        class="w-full px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors text-left group">
                                                                     <span class="text-sm group-hover:scale-110 transition-transform">{{ country.flag }}</span>
                                                                     <div class="flex flex-col">
                                                                         <span class="text-[10px] font-bold text-slate-700">{{ country.name }}</span>
                                                                         <span class="text-[9px] font-medium text-slate-400">{{ country.dialCode }}</span>
                                                                     </div>
                                                                </button>
                                                            }
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <input type="tel" autocomplete="tel" [ngModel]="editForm().customer_phone" (ngModelChange)="updateEditField('customer_phone', $event)" 
                                               placeholder="300 123 4567"
                                               class="flex-1 h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-[#002B5B] mb-1.5 uppercase ml-1">{{ lang.t('reservas.edit.email') }}</label>
                                    <input type="email" autocomplete="email" spellcheck="false" [ngModel]="editForm().customer_email" (ngModelChange)="updateEditField('customer_email', $event)" 
                                           class="w-full h-12 px-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#002B5B] transition-all font-medium text-slate-700">
                                </div>
                            </div>
                        </section>

                        <!-- Logistics Section -->
                        <section>
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {{ lang.t('reservas.edit.dates') }}
                            </h3>
                            
                            <div class="bg-slate-50 rounded-2xl p-5 ring-1 ring-slate-100">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                    
                                    <!-- Pickup -->
                                    <div class="relative z-20">
                                        <label class="block text-xs font-bold text-[#002B5B] mb-2 uppercase">{{ lang.t('reservas.pickup') }}</label>
                                        <div class="space-y-3">
                                            <div class="grid grid-cols-5 gap-2">
                                                <div class="col-span-3 relative">
                                                    <button type="button" (click)="toggleCalendar('pickup', $event)"
                                                            class="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-between hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase">
                                                        <span>{{ editForm().pickup_date | date:'dd/MM/yyyy' }}</span>
                                                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </button>

                                                    @if (isCalendarOpen('pickup')) {
                                                        <div class="fixed inset-0 z-[200]" (click)="activeCalendar.set(null)"></div>
                                                        <div class="absolute top-12 left-0 z-[201] w-72 shadow-xl rounded-xl overflow-hidden border border-slate-100 bg-white" (click)="$event.stopPropagation()">
                                                            <app-calendar 
                                                                [date]="getParsedDate(editForm().pickup_date)"
                                                                (dateSelected)="handleDateSelection('pickup', $event)">
                                                            </app-calendar>
                                                        </div>
                                                    }
                                                </div>
                                                <div class="col-span-2 relative">
                                                    <button type="button" 
                                                            (click)="pickupTimeOpen.set(!pickupTimeOpen()); activeCalendar.set(null)"
                                                            class="w-full h-11 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between">
                                                        <span>{{ formatTimeOnly(editForm().pickup_time) }}</span>
                                                        <svg class="w-4 h-4 text-slate-400 transition-transform duration-300" [class.rotate-180]="pickupTimeOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </button>

                                                    @if (pickupTimeOpen()) {
                                                        <div class="fixed inset-0 z-[100]" (click)="pickupTimeOpen.set(false)"></div>
                                                        <div class="absolute top-12 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-white border border-slate-200 rounded-xl shadow-xl z-[101]">
                                                            @for (t of timeOptions; track t) {
                                                                <button (click)="updateEditField('pickup_time', t); pickupTimeOpen.set(false)"
                                                                        class="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#002B5B] transition-colors">
                                                                    {{ t }}
                                                                </button>
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div class="relative">
                                                <div class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 flex items-center gap-2 cursor-not-allowed">
                                                    <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    Cartagena
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Dropoff -->
                                    <div class="relative z-10">
                                        <label class="block text-xs font-bold text-[#002B5B] mb-2 uppercase">{{ lang.t('reservas.return') }}</label>
                                        <div class="space-y-3">
                                            <div class="grid grid-cols-5 gap-2">
                                                <div class="col-span-3 relative">
                                                    <button type="button" (click)="toggleCalendar('dropoff', $event)"
                                                            class="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-between hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase">
                                                        <span>{{ editForm().dropoff_date | date:'dd/MM/yyyy' }}</span>
                                                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </button>
                                                    
                                                    @if (isCalendarOpen('dropoff')) {
                                                        <div class="fixed inset-0 z-[200]" (click)="activeCalendar.set(null)"></div>
                                                        <div class="absolute top-12 left-0 z-[201] w-72 shadow-xl rounded-xl overflow-hidden border border-slate-100 bg-white" (click)="$event.stopPropagation()">
                                                            <app-calendar 
                                                                [date]="getParsedDate(editForm().dropoff_date)"
                                                                [minDate]="getDropoffMinDate()"
                                                                (dateSelected)="handleDateSelection('dropoff', $event)">
                                                            </app-calendar>
                                                        </div>
                                                    }
                                                </div>
                                                <div class="col-span-2 relative">
                                                    <button type="button" 
                                                            (click)="dropoffTimeOpen.set(!dropoffTimeOpen()); activeCalendar.set(null)"
                                                            class="w-full h-11 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between">
                                                        <span>{{ formatTimeOnly(editForm().dropoff_time) }}</span>
                                                        <svg class="w-4 h-4 text-slate-400 transition-transform duration-300" [class.rotate-180]="dropoffTimeOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </button>  

                                                    @if (dropoffTimeOpen()) {
                                                        <div class="fixed inset-0 z-[100]" (click)="dropoffTimeOpen.set(false)"></div>
                                                        <div class="absolute top-12 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-white border border-slate-200 rounded-xl shadow-xl z-[101]">
                                                            @for (t of timeOptions; track t) {
                                                                <button (click)="updateEditField('dropoff_time', t); dropoffTimeOpen.set(false)"
                                                                        class="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#002B5B] transition-colors">
                                                                    {{ t }}
                                                                </button>
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div class="relative">
                                                <button type="button" 
                                                        (click)="dropoffLocationOpen.set(!dropoffLocationOpen()); activeCalendar.set(null)"
                                                        class="w-full h-11 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between">
                                                    <span>{{ editForm().dropoff_location || 'Cartagena' }}</span>
                                                    <svg class="w-4 h-4 text-slate-400 transition-transform duration-300" [class.rotate-180]="dropoffLocationOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </button>

                                                @if (dropoffLocationOpen()) {
                                                    <div class="fixed inset-0 z-[100]" (click)="dropoffLocationOpen.set(false)"></div>
                                                    <div class="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[101] overflow-hidden">
                                                        <button (click)="selectDropoffLocation('Cartagena')"
                                                                class="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#002B5B] transition-colors border-b border-slate-50">
                                                            Cartagena
                                                        </button>
                                                        <button (click)="selectDropoffLocation('Barranquilla')"
                                                                class="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#002B5B] transition-colors border-b border-slate-50">
                                                            Barranquilla
                                                        </button>
                                                        <button (click)="selectDropoffLocation('Santa Marta')"
                                                                class="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#002B5B] transition-colors">
                                                            Santa Marta
                                                        </button>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- 3. Vehículo -->
                        <section>
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Vehículo Seleccionado</h3>
                            
                            <!-- Horizontal Scroll Categories -->
                            <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory hide-scrollbar">
                                @for (cat of availableCategories(); track cat.id) {
                                    <div (click)="selectCategory(cat)"
                                         class="flex-shrink-0 w-36 snap-center rounded-2xl border-2 transition-all overflow-hidden"
                                         [class.border-[#002B5B]]="editForm().category_id == cat.id"
                                         [class.shadow-lg]="editForm().category_id == cat.id"
                                         [class.border-slate-100]="editForm().category_id != cat.id"
                                         [class.opacity-40]="!cat.is_available"
                                         [class.cursor-pointer]="cat.is_available"
                                         [class.cursor-not-allowed]="!cat.is_available">
                                        
                                        <div class="h-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
                                            <img [src]="cat.image_url" class="h-14 object-contain mix-blend-multiply" alt="">
                                            <div class="absolute top-1 right-1 w-5 h-5 bg-[#002B5B] rounded-full flex items-center justify-center"
                                                 [class.hidden]="editForm().category_id != cat.id">
                                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                            </div>
                                            <div class="absolute inset-0 bg-blue-50/90 backdrop-blur-[1px] flex items-center justify-center"
                                                 [class.hidden]="cat.is_available">
                                                <span class="text-[10px] font-black text-blue-500 uppercase tracking-wider">RESERVADO</span>
                                            </div>
                                        </div>
                                        
                                        <div class="p-2 text-center bg-white">
                                            <p class="text-[11px] font-black text-[#002B5B] uppercase italic leading-tight truncate">{{ cat.name }}</p>
                                            <p class="text-[9px] text-slate-400 font-medium">{{ cat.passengers }} Pasajeros</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        </section>

                    </div>

                    <!-- Footer -->
                    <div class="p-6 border-t border-slate-100 flex gap-3 bg-white sticky bottom-0 z-10">
                        <button (click)="closeEditModal()" 
                                class="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-xs hover:bg-slate-50 transition-colors">
                            {{ lang.t('reservas.cancel_action') }}
                        </button>
                        <button (click)="saveChanges()" 
                                [disabled]="isLoading() || isCheckingAvailability()"
                                class="flex-[2] py-3.5 rounded-xl bg-[#002B5B] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#003875] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex justify-center items-center gap-2">
                            @if (isLoading()) {
                                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            }
                            {{ lang.t('reservas.save') }}
                        </button>
                    </div>
                </div>
            </div>
        }


        <!-- DROPOFF NOTIFICATION MODAL (Premium Style) -->
        @if (showDropoffModal()) {
            <div class="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in" (click)="showDropoffModal.set(false)">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300" (click)="$event.stopPropagation()">
                    
                    <!-- Header -->
                    <div class="flex items-center justify-between px-6 pt-5 pb-2">
                        <div class="flex items-center gap-2">
                            <h3 class="text-[1.31rem] font-black text-slate-800 uppercase tracking-wider italic">
                                {{ dropoffModalData().type === 'fee' ? 'UBICACIÓN DE ENTREGA' : 'REQUISITO DE RESERVA' }}
                            </h3>
                            <span class="w-6 h-1 bg-[#FF6F61] rounded-full hidden xs:block"></span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[0.6rem] font-bold text-[#FF6F61] uppercase tracking-widest hidden sm:block">
                                {{ dropoffModalData().type === 'fee' ? 'COSTO ADICIONAL' : 'DÍAS MÍNIMOS' }}
                            </span>
                            <button aria-label="Cerrar" (click)="showDropoffModal.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Content Body -->
                    <div class="px-6 pb-6 pt-2">
                        @if (dropoffModalData().type === 'fee') {
                            <p class="text-sm font-bold text-slate-600 mb-4 text-center">{{ lang.t('reservas.dropoff_modal.details_label') }}</p>
                            
                            <!-- Fee Display Box -->
                            <div class="bg-slate-50/50 rounded-xl p-6 border border-slate-100 mb-5 flex flex-col items-center justify-center">
                                <div class="flex items-center gap-2 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#FF6F61]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ lang.t('reservas.dropoff_modal.destination') }} <span class="text-[#002B5B]">{{ dropoffModalData().city }}</span></span>
                                </div>
                                <p class="text-3xl font-black text-[#002B5B] tracking-tighter">
                                    +{{ currencyService.formatPrice(dropoffModalData().fee ?? 0) }}
                                </p>
                                <p class="text-[12px] text-slate-400 font-medium mt-1">{{ lang.t('reservas.dropoff_modal.note') }}</p>
                            </div>

                            <!-- Footer Actions -->
                            <div class="grid grid-cols-2 gap-3">
                                <button (click)="showDropoffModal.set(false)" 
                                        class="w-full py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 uppercase tracking-wider">
                                    {{ lang.t('reservas.cancel_action') }}
                                </button>
                                <button (click)="confirmDropoffLocation()" 
                                        class="w-full py-2.5 text-xs font-bold text-white bg-[#002B5B] hover:bg-[#003875] rounded-lg shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wider">
                                    {{ lang.t('general.accept') }}
                                </button>
                            </div>
                        } @else {
                            <!-- Error / Min Days Display -->
                            <div class="bg-red-50/50 rounded-xl p-6 border border-red-100 mb-5 flex flex-col items-center justify-center text-center">
                                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 text-red-500">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <p class="text-sm font-bold text-slate-700 mb-2">{{ lang.t('reservas.dropoff_modal.min_title') }}</p>
                                <p class="text-xs text-slate-500 leading-relaxed">
                                    {{ lang.t('reservas.dropoff_modal.intro') }} <span class="font-bold text-[#002B5B]">{{ dropoffModalData().city }}</span>{{ lang.t('reservas.dropoff_modal.req') }} <span class="font-bold text-[#FF6F61]">{{ dropoffModalData().minDays }} {{ lang.t('reservas.days') }}</span>.
                                </p>
                            </div>
                            
                            <button (click)="showDropoffModal.set(false)" 
                                    class="w-full py-3 text-xs font-bold text-white bg-slate-400 hover:bg-slate-500 rounded-lg shadow-sm transition-all uppercase tracking-wider">
                                {{ lang.t('reservas.understood') }}
                            </button>
                        }
                    </div>
                </div>
            </div>
        }
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeaderComponent, RouterModule, FormsModule, CalendarComponent],
})
export class ReservasComponent implements OnInit {
  protected router = inject(Router);
  protected apiService = inject(ApiService);
  protected bookingService = inject(BookingService);
  protected currencyService = inject(CurrencyService);
  protected lang = inject(LanguageService);

  readonly timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });
  // private router = inject(Router); // Removed duplicate

  isLoading = signal(true);
  bookings = signal<any[]>([]);
  currentTab = signal<'active' | 'future' | 'past'>('active');

  selectedBooking = signal<any>(null);

  constructor() { }

  ngOnInit() {
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadBookings();
  }

  loadBookings() {
    this.apiService.getMyBookings().subscribe({
      next: (data) => {
        // Sort by date desc
        const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        this.bookings.set(sorted);
        this.isLoading.set(false);

        // Auto-switch tab if no active bookings but has future or past
        if (this.activeBookings().length === 0) {
          if (this.futureBookings().length > 0) this.currentTab.set('future');
          else if (this.pastBookings().length > 0) this.currentTab.set('past');
        }
      },
      error: (err) => {
        console.error('Error loading bookings', err);
        this.isLoading.set(false);
      }
    });
  }

  // --- ACTIONS ---
  openModal(booking: any) {
    this.selectedBooking.set(booking);
  }

  closeModal() {
    this.selectedBooking.set(null);
  }

  // Edit State
  isEditing = signal(false);
  editForm = signal<any>({});
  availableCategories = signal<any[]>([]);
  isCheckingAvailability = signal(false);
  previousFormState = signal<any>(null); // To revert invalid changes


  editBooking(booking: any) {
    // robust date parsing for inputs
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);

    this.editForm.set({
      ...booking,
      pickup_date: startDate.toISOString().split('T')[0],
      dropoff_date: endDate.toISOString().split('T')[0],
      // Clean times (remove :00 if present)
      pickup_time: booking.pickup_time?.substring(0, 5) || '10:00',
      dropoff_time: booking.dropoff_time?.substring(0, 5) || '10:00'
    });
    this.isEditing.set(true);
    this.closeModal();
    this.checkEditAvailability();
  }

  closeEditModal() {
    this.isEditing.set(false);
    this.editForm.set({});
  }

  updateEditField(field: string, value: any) {
    const current = this.editForm();
    const isLogistics = ['pickup_date', 'dropoff_date', 'pickup_time', 'dropoff_time'].includes(field);

    // Save state before change if it's logistics
    if (isLogistics) {
      this.previousFormState.set({ ...current });
    }

    this.editForm.set({ ...current, [field]: value });

    // Trigger availability check if logistics change
    if (isLogistics) {
      this.checkEditAvailability();

      // Also validate dropoff rules if dates changed
      if (field === 'pickup_date' || field === 'dropoff_date') {
        const isValid = this.validateCurrentDropoffRules();
        if (!isValid) {
          // Revert to previous state
          console.log('Invalid date change, reverting...');
          this.editForm.set(this.previousFormState());
        }
      }
    }
  }

  selectCategory(cat: any) {
    if (cat.is_available) {
      console.log('Selecting category:', cat.id);
      this.updateEditField('category_id', cat.id);
    }
  }

  checkEditAvailability() {
    const form = this.editForm();
    if (!form.pickup_date || !form.dropoff_date) return;

    this.isCheckingAvailability.set(true);
    this.apiService.checkAvailability(form.pickup_date, form.dropoff_date, form.pickup_time, form.dropoff_time)
      .subscribe({
        next: (cats) => {
          this.availableCategories.set(cats);
          this.isCheckingAvailability.set(false);
        },
        error: () => this.isCheckingAvailability.set(false)
      });
  }

  // --- CALENDAR HELPERS ---
  activeCalendar = signal<'pickup' | 'dropoff' | null>(null);

  toggleCalendar(type: 'pickup' | 'dropoff', event: Event) {
    event.stopPropagation();
    if (this.activeCalendar() === type) {
      this.activeCalendar.set(null);
    } else {
      this.activeCalendar.set(type);
    }
  }

  isCalendarOpen(type: 'pickup' | 'dropoff') {
    return this.activeCalendar() === type;
  }

  handleDateSelection(type: 'pickup' | 'dropoff', date: Date) {
    // Format to YYYY-MM-DD for input compatibility (local time)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (type === 'pickup') {
      this.updateEditField('pickup_date', dateStr);
    } else {
      this.updateEditField('dropoff_date', dateStr);
    }
    this.activeCalendar.set(null);
  }

  // --- DROPDOWN SIGNALS ---
  pickupTimeOpen = signal(false);
  dropoffTimeOpen = signal(false);
  dropoffLocationOpen = signal(false);

  // --- DROPOFF LOGIC ---
  // --- DROPOFF LOGIC ---
  showDropoffModal = signal(false);
  dropoffModalData = signal<{ type: 'fee' | 'error', city: string, fee?: number, minDays?: number }>({ type: 'fee', city: '' });
  pendingCity = signal<string>('');

  selectDropoffLocation(city: string) {
    // Just trigger the validation logic, it handles the UI
    this.validateAndSetDropoff(city);
  }

  // Centeralized validation that can be called from city select OR date change
  validateAndSetDropoff(newCity: string) {
    const start = this.getParsedDateTime(this.editForm().pickup_date, this.editForm().pickup_time);
    const end = this.getParsedDateTime(this.editForm().dropoff_date, this.editForm().dropoff_time);

    let diffDays = 1;
    let diffHours = 24;
    if (start && end) {
      const diffTime = end.getTime() - start.getTime();
      diffHours = diffTime / (1000 * 60 * 60);
      diffDays = Math.ceil(diffHours / 24);
      if (diffDays === 0) diffDays = 1;
    }

    // Common 24h check for all cities
    if (diffHours < 24) {
      this.dropoffModalData.set({ type: 'error', city: newCity === 'Cartagena' ? 'Cartagena' : newCity, minDays: 1 });
      this.showDropoffModal.set(true);
      return;
    }

    if (newCity === 'Barranquilla') {
      if (diffDays < 3) {
        this.dropoffModalData.set({ type: 'error', city: 'Barranquilla', minDays: 3 });
        this.showDropoffModal.set(true);
        return;
      }
      this.pendingCity.set(newCity);
      this.dropoffModalData.set({ type: 'fee', city: 'Barranquilla', fee: 250000 });
      this.showDropoffModal.set(true);
      return;
    }

    if (newCity === 'Santa Marta') {
      if (diffDays < 5) {
        this.dropoffModalData.set({ type: 'error', city: 'Santa Marta', minDays: 5 });
        this.showDropoffModal.set(true);
        return;
      }
      this.pendingCity.set(newCity);
      this.dropoffModalData.set({ type: 'fee', city: 'Santa Marta', fee: 350000 });
      this.showDropoffModal.set(true);
      return;
    }

    // Valid / No strings attached
    this.updateEditField('dropoff_location', newCity);
    this.dropoffLocationOpen.set(false);
  }

  // Called when dates change to re-validate the CURRENTLY selected city
  validateCurrentDropoffRules(): boolean {
    const currentCity = this.editForm().dropoff_location;
    if (!currentCity) return true;

    const start = this.getParsedDateTime(this.editForm().pickup_date, this.editForm().pickup_time);
    const end = this.getParsedDateTime(this.editForm().dropoff_date, this.editForm().dropoff_time);

    let diffDays = 1;
    let diffHours = 24;
    if (start && end) {
      const diffTime = end.getTime() - start.getTime();
      diffHours = diffTime / (1000 * 60 * 60);
      diffDays = Math.ceil(diffHours / 24);
      if (diffDays === 0) diffDays = 1;
    }

    // General 24h requirement
    if (diffHours < 24) {
      this.dropoffModalData.set({ type: 'error', city: currentCity, minDays: 1 });
      this.showDropoffModal.set(true);
      return false;
    }

    if (currentCity === 'Cartagena') return true;

    if (currentCity === 'Barranquilla' && diffDays < 3) {
      this.dropoffModalData.set({ type: 'error', city: 'Barranquilla', minDays: 3 });
      this.showDropoffModal.set(true);
      return false;
    } else if (currentCity === 'Santa Marta' && diffDays < 5) {
      this.dropoffModalData.set({ type: 'error', city: 'Santa Marta', minDays: 5 });
      this.showDropoffModal.set(true);
      return false;
    }
    // Note: We don't show the 'fee' modal again on date change if it's valid, just errors.
    return true;
  }

  confirmDropoffLocation() {
    this.updateEditField('dropoff_location', this.pendingCity());
    this.showDropoffModal.set(false);
    this.dropoffLocationOpen.set(false);
  }

  getDropoffMinDate(): Date {
    const startStr = this.editForm().pickup_date;
    if (!startStr) return new Date(); // Default to today logic handled by calendar

    const start = this.getParsedDate(startStr);
    if (!start) return new Date();

    const location = this.editForm().dropoff_location;
    let daysToAdd = 1; // Default 1 day (Cartagena or general)

    if (location === 'Barranquilla') daysToAdd = 3;
    else if (location === 'Santa Marta') daysToAdd = 5;

    // Create new date starting from pickup + required days
    // Note: If I pick up on 10th, and needs 3 days:
    // 10 (day 1), 11 (day 2), 12 (day 3). Earliest dropoff is 12th? Or 3 * 24h?
    // Usually "3 days" means X + 3. Let's assume X + daysToAdd - 1 or X + daysToAdd.
    // Let's use X + daysToAdd for safety (e.g. 1st -> 4th is 3 nights).
    // If requirement is "3 days/24h blocks", usually 72 hours.

    const minEnd = new Date(start);
    minEnd.setDate(minEnd.getDate() + daysToAdd);

    return minEnd;
  }

  getParsedDate(dateStr: string | undefined): Date | null {
    if (!dateStr) return null;
    return new Date(dateStr + 'T00:00:00');
  }

  getParsedDateTime(dateStr: string | undefined, timeStr: string | undefined): Date | null {
    if (!dateStr) return null;
    const time = timeStr || '10:00';
    return new Date(`${dateStr}T${time.length === 5 ? time + ':00' : time}`);
  }

  saveChanges() {
    this.isLoading.set(true);
    const form = this.editForm();

    // Construct clean payload matching API expected structure
    const payload = {
      // Map to backend fields (ensure format YYYY-MM-DD)
      start_date: form.pickup_date,
      end_date: form.dropoff_date,

      // Include original fields
      pickup_date: form.pickup_date,
      dropoff_date: form.dropoff_date,

      // Ensure times have seconds for strict backend compliance
      pickup_time: form.pickup_time.length === 5 ? form.pickup_time + ':00' : form.pickup_time,
      dropoff_time: form.dropoff_time.length === 5 ? form.dropoff_time + ':00' : form.dropoff_time,

      pickup_location: form.pickup_location,
      dropoff_location: form.dropoff_location,

      // Coerce category to number
      category_id: Number(form.category_id),

      customer_phone: form.customer_phone,
      customer_email: form.customer_email,
      phone_code: form.phone_code,

      // Ensure ID is number
      id: Number(form.id),

      // ADD EXTRA FIELDS THAT MIGHT BE EXPECTED BY BACKEND
      category: Number(form.category_id), // Some backends might look for 'category'
      vehicle_id: Number(form.category_id) // Or 'vehicle_id'
    };

    console.log('Sending payload:', payload);

    this.apiService.clientUpdateBooking(form.id, payload).subscribe({
      next: () => {
        alert(this.lang.t('reservas.alerts.update_success'));
        this.closeEditModal();
        this.loadBookings();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Update failed', err);
        const msg = err.error?.message || this.lang.t('reservas.alerts.update_error');
        alert(msg);
        this.isLoading.set(false);
      }
    });
  }

  cancelBooking(booking: any) {
    const confirmMsg = this.lang.t('reservas.alerts.cancel_confirm').replace('{code}', booking.code);
    if (confirm(confirmMsg)) {
      this.isLoading.set(true);
      this.apiService.clientCancelBooking(booking.id).subscribe({
        next: () => {
          alert(this.lang.t('reservas.alerts.cancel_success'));
          this.currentTab.set('past'); // Move tab to see it in cancelled
          this.loadBookings(); // Reload to update status in UI
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          alert(this.lang.t('reservas.alerts.cancel_error'));
          this.isLoading.set(false);
        }
      });
    }
  }

  contactSupport() {
    const bookingCode = this.selectedBooking()?.code || 'mi reserva';
    const msg = this.lang.t('reservas.whatsapp.msg').replace('{code}', bookingCode);
    const message = encodeURIComponent(msg);
    // Replace current number with the official support number if available, otherwise use a placeholder or ask user to provide it later.
    // Assuming a generic placeholder or the user's business number.
    window.open(`https://wa.me/573001234567?text=${message}`, '_blank');
  }

  // --- DDI Logic ---
  showManualDDI = signal(false);
  countries = COUNTRIES;
  ddiSearch = signal('');

  filteredDDI = computed(() => {
    const search = this.ddiSearch().toLowerCase();
    return this.countries.filter(c =>
      c.dialCode.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search)
    );
  });

  filterDDI(val: string) {
    this.ddiSearch.set(val);
  }

  selectManualDDI(country: Country) {
    this.updateEditField('phone_code', country.dialCode);
    this.ddiSearch.set(''); // Reset search
    this.showManualDDI.set(false);
  }

  // --- HELPERS ---
  getInitials(name: string) {
    return (name || '').substring(0, 2).toUpperCase();
  }

  formatDateShort(dateStr: string) {
    if (!dateStr) return '';
    const datePart = dateStr.toString().split(' ')[0].split('T')[0];
    const parts = datePart.split('-');
    if (parts.length < 3) return dateStr;

    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    const locale = this.lang.currentLang() === 'ES' ? 'es-CO' : 'en-US';
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  }

  formatDateFull(dateStr: string) {
    if (!dateStr) return '';
    const datePart = dateStr.toString().split(' ')[0].split('T')[0];
    const parts = datePart.split('-');
    if (parts.length < 3) return dateStr;

    // We create a date at noon to get the correct day of the week safely
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    const locale = this.lang.currentLang() === 'ES' ? 'es-CO' : 'en-US';
    return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  }

  formatTimeOnly(timeStr: string) {
    if (!timeStr) return '10:00';
    // Ensure we only show HH:mm (10:00:00 -> 10:00)
    return timeStr.toString().substring(0, 5);
  }

  // Categories
  activeBookings = computed(() => {
    const now = new Date();
    return this.bookings().filter(b => {
      // Exclude maintenance and cancelled
      if (b.status === 'maintenance' || b.status === 'cancelled') return false;
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      // It is active if started and not yet ended
      return start <= now && end >= now;
    });
  });

  futureBookings = computed(() => {
    const now = new Date();
    return this.bookings().filter(b => {
      // Exclude maintenance and cancelled
      if (b.status === 'maintenance' || b.status === 'cancelled') return false;
      const start = new Date(b.start_date);
      // It is future if it hasn't started yet
      return start > now;
    });
  });

  pastBookings = computed(() => {
    const now = new Date();
    const all = this.bookings().filter(b => b.status !== 'maintenance'); // First exclude maintenance

    const completed = all.filter(b => {
      // Exclude cancelled from "completed" logic if we want them separate, 
      // but usually they go to "Finalizadas" tab.
      if (b.status === 'cancelled') return false;
      const end = new Date(b.end_date);
      return end < now;
    });

    const cancelled = this.bookings().filter(b => b.status === 'cancelled');

    // Return completed first, then cancelled
    return [...completed, ...cancelled];
  });

  currentList = computed(() => {
    switch (this.currentTab()) {
      case 'active': return this.activeBookings();
      case 'future': return this.futureBookings();
      case 'past': return this.pastBookings();
      default: return [];
    }
  });

  tabName = computed(() => {
    switch (this.currentTab()) {
      case 'active': return 'en proceso';
      case 'future': return 'pendientes';
      case 'past': return 'finalizadas';
      default: return '';
    }
  });

  // Helpers for Template
  isProcessing(b: any) {
    if (b.status === 'cancelled') return false;
    const now = new Date();
    const start = new Date(b.start_date);
    const end = new Date(b.end_date);
    return start <= now && end >= now;
  }

  isFuture(b: any) {
    if (b.status === 'cancelled') return false;
    const now = new Date();
    const start = new Date(b.start_date);
    return start > now;
  }

  isPast(b: any) {
    if (b.status === 'cancelled') return false; // Handled separately now
    const now = new Date();
    const end = new Date(b.end_date);
    return end < now;
  }

  isCancelled(b: any) {
    return b.status === 'cancelled';
  }

  getCancellationInfo(booking: any): { actor: string, dateTime: string } {
    if (!booking.notes) return { actor: 'Cancelada', dateTime: '' };

    const notes = booking.notes as string;

    // Look for who cancelled
    let actor = 'Cancelada';
    if (notes.includes('CANCELADA POR EL USUARIO')) {
      actor = 'Cancelada por Tí';
    } else if (notes.includes('CANCELADA POR ADMINISTRADOR')) {
      actor = 'Cancelada por Administración';
    }

    // Look for cancellation date - flexible regex for encoding issues
    const dateMatch = notes.match(/Fecha de cancelaci[oó]n: ([^\n]+)/);
    const dateTime = dateMatch ? dateMatch[1].trim() : '';

    return { actor, dateTime };
  }

  getOriginalDropoffData(booking: any): { date: string, time: string } {
    // Simply return the preserved database fields
    return {
      date: this.formatDateFull(booking.end_date),
      time: this.formatTimeOnly(booking.dropoff_time)
    };
  }
}
