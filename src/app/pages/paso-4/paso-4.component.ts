import { ApiService } from '../../../services/api.service';
import { Component, ChangeDetectionStrategy, inject, computed, signal, ElementRef, ViewChild, HostListener, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { Hero6Component } from '../../../components/hero6/hero6.component';
import { StepProgressComponent } from '../../../components/step-progress/step-progress.component';
import { ReservationTicketComponent } from '../../../components/reservation-ticket/reservation-ticket.component';
import { BookingService } from '../../../services/booking.service';
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
    selector: 'app-paso-4',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        HeaderComponent,
        Hero6Component,
        StepProgressComponent,
        ReservationTicketComponent
    ],
    template: `
    <div class="h-screen flex flex-col overflow-y-auto bg-[#FBFBFD]">
        <app-header variant="white" class="relative z-50"></app-header>
        <main class="flex-1 relative flex flex-col items-center pt-28 pb-12 gap-2 md:gap-3">
            <div class="absolute inset-0 z-0 h-full w-full">
                <app-hero6></app-hero6>
            </div>
            
             <div class="relative z-20 text-center text-white drop-shadow-md px-4 shrink-0">
                 <h2 class="text-2xl md:text-3xl font-extrabold uppercase tracking-wider italic leading-tight">{{ lang.t('paso4.title') }}</h2>
                 <p class="text-xs md:text-sm font-light opacity-90 mt-1">{{ lang.t('paso4.subtitle') }}</p>
             </div>

            <div class="relative z-20 w-full max-w-2xl px-6 shrink-0">
                <app-step-progress [currentStep]="4" [totalSteps]="4"></app-step-progress>
            </div>

            <div class="relative z-20 w-full max-w-7xl px-4 md:px-6 mt-6 flex flex-col gap-8 items-center en">
                
                <div class="w-full bg-white rounded-[2.5rem] p-5 md:p-8 shadow-2xl border border-gray-100">
                    <div class="mb-5">
                        <h3 class="text-3xl md:text-4xl font-black text-[#002B5B] uppercase tracking-tighter italic">{{ lang.t('paso4.driver_details') }}</h3>
                        <div class="h-1.5 w-20 bg-[#FF6F61] mt-1.5 rounded-full"></div>
                    </div>

                    <form class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                            <!-- Nombre -->
                            <div class="relative group">
                                <label class="block text-[#002B5B] font-extrabold text-[12px] uppercase tracking-widest mb-2 transition-colors group-focus-within:text-[#FF6F61]">{{ lang.t('paso4.full_name') }} *</label>
                                <input type="text" autocomplete="name" [placeholder]="lang.t('paso4.full_name_ph')" 
                                       [value]="fullName()"
                                       [disabled]="isEditing()"
                                       (input)="onFullNameInput($any($event.target).value)"
                                       class="w-full border-b-2 border-gray-100 focus:border-[#FF6F61] py-3 outline-none transition-all text-[#002B5B] font-bold text-lg placeholder:text-gray-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed">
                            </div>

                            <!-- Nacionalidad Custom Dropdown -->
                            <div class="relative group" #nationalityRef>
                                <label class="block text-[#002B5B] font-extrabold text-[12px] uppercase tracking-widest mb-2 transition-colors group-focus-within:text-[#FF6F61]">{{ lang.t('paso4.nationality') }} *</label>
                                <div role="button" tabindex="0" (click)="!isEditing() && toggleNationality()" (keydown.enter)="!isEditing() && toggleNationality()" (keydown.space)="!isEditing() && toggleNationality(); $event.preventDefault()" 
                                     class="w-full border-b-2 border-gray-100 py-3 cursor-pointer flex justify-between items-center group-focus-within:border-[#FF6F61]"
                                     [class.opacity-50]="isEditing()" [class.cursor-not-allowed]="isEditing()">
                                    <span class="font-bold text-lg flex items-center gap-2 transition-colors"
                                          [class.text-[#002B5B]]="nationalityTouched()"
                                          [class.text-gray-300]="!nationalityTouched()">
                                        <span *ngIf="nationalityTouched()">{{ selectedNationality()?.flag }}</span>
                                        <span>{{ nationalityTouched() ? selectedNationality()?.name : lang.t('paso4.select') }}</span>
                                    </span>
                                    <svg class="w-5 h-5 text-gray-400 transition-transform duration-300" [class.rotate-180]="showNationality()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>

                                <!-- Apple-style Dropdown -->
                                <div *ngIf="showNationality()" 
                                     class="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                                    <div class="p-3 border-b border-gray-50">
                                        <input type="text" [placeholder]="lang.t('paso4.search_country')" 
                                               (input)="filterNationality($any($event.target).value)"
                                               class="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF6F61]/20 font-medium font-bold text-[#002B5B]">
                                    </div>
                                    <div class="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                        <div *ngFor="let country of filteredCountries()" 
                                             (click)="selectNationality(country)"
                                             class="flex items-center gap-3 px-4 py-3 hover:bg-[#FF6F61]/5 rounded-xl cursor-pointer transition-colors group/item">
                                            <span class="text-xl">{{ country.flag }}</span>
                                            <span class="text-[#002B5B] font-bold text-sm tracking-tight">{{ country.name }}</span>
                                            <svg *ngIf="country.code === selectedNationality()?.code" class="ml-auto w-4 h-4 text-[#FF6F61]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                            <!-- Email con Validación -->
                            <div class="relative group">
                                <label class="block text-[#002B5B] font-extrabold text-[12px] uppercase tracking-widest mb-2 transition-colors"
                                       [class.text-red-500]="emailTouched() && !emailValid()"
                                       [class.group-focus-within:text-[#FF6F61]="emailValid() || !emailTouched()">{{ lang.t('paso4.email') }} *</label>
                                <input type="email" autocomplete="email" spellcheck="false" [placeholder]="lang.t('paso4.email_ph')" 
                                       [value]="emailValue()"
                                       [disabled]="isEditing()"
                                       (input)="onEmailInput($any($event.target).value)"
                                       (blur)="emailTouched.set(true)"
                                       class="w-full border-b-2 py-3 outline-none transition-all text-[#002B5B] font-bold text-lg placeholder:text-gray-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                       [class.border-red-400]="emailTouched() && !emailValid()"
                                       [class.border-gray-100]="!emailTouched() || emailValid()"
                                       [class.focus:border-[#FF6F61]]="emailValid() || !emailTouched()">
                                <div *ngIf="emailTouched() && !emailValid()" class="absolute -bottom-6 left-0 text-red-500 text-[0.6rem] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1">{{ lang.t('paso4.email_error') }}</div>
                            </div>

                            <!-- DDI + Phone (Editable DDI) -->
                            <div class="grid grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] gap-6">
                                <div class="relative group" #ddiRef>
                                    <label class="block text-[#002B5B] font-extrabold text-[12px] uppercase tracking-widest mb-2 transition-colors group-focus-within:text-[#FF6F61]">{{ lang.t('paso4.ddi') }} *</label>
                                    <div class="w-full border-b-2 border-gray-100 py-3 flex items-center gap-2 group-focus-within:border-[#FF6F61]"
                                         [class.opacity-50]="isEditing()">
                                        <span class="text-xl shrink-0 cursor-pointer hover:scale-110 transition-transform" 
                                              (click)="!isEditing() && toggleDDI()">{{ selectedDDI()?.flag || '🇨🇴' }}</span>
                                        <input type="text" 
                                               [value]="ddiTouched() ? ddiSearch() : ''"
                                               [disabled]="isEditing()"
                                               (input)="filterDDI($any($event.target).value)"
                                               (keydown)="onlyNumbers($event)"
                                               (focus)="showDDI.set(true); ddiSearch.set(''); ddiTouched.set(true)"
                                               (blur)="onDDIBlur()"
                                               maxlength="3"
                                               class="w-full bg-transparent outline-none font-bold text-lg transition-colors disabled:cursor-not-allowed"
                                               [class.text-[#002B5B]]="ddiTouched()"
                                               [class.text-gray-300]="!ddiTouched()"
                                               placeholder="+57">
                                        <svg (click)="!isEditing() && toggleDDI()" 
                                             class="w-4 h-4 text-gray-400 cursor-pointer transition-transform duration-300" 
                                             [class.rotate-180]="showDDI()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                    
                                    <!-- Searchable DDI Dropdown -->
                                    <div *ngIf="showDDI()" 
                                         class="absolute left-0 w-64 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                                        <div class="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                            <div *ngFor="let country of filteredDDI()" 
                                                 (click)="selectDDI(country)"
                                                 class="flex items-center gap-4 px-4 py-3 hover:bg-[#FF6F61]/5 rounded-xl cursor-pointer transition-colors group/item">
                                                <span class="text-xl shrink-0">{{ country.flag }}</span>
                                                <span class="text-[#002B5B] font-bold text-sm tracking-tight">{{ country.name }}</span>
                                                <span class="text-[#FF6F61] font-black text-xs ml-auto">{{ country.dialCode }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="relative group">
                                    <label class="block text-[#002B5B] font-extrabold text-[12px] uppercase tracking-widest mb-2 transition-colors group-focus-within:text-[#FF6F61]">{{ lang.t('paso4.cellphone') }} *</label>
                                    <input type="tel" autocomplete="tel" placeholder="300 000 0000" 
                                           [value]="phoneNumber()"
                                           [disabled]="isEditing()"
                                           (input)="onPhoneInput($any($event.target).value)"
                                           (keydown)="onlyNumbers($event)"
                                           maxlength="12"
                                           class="w-full border-b-2 border-gray-100 focus:border-[#FF6F61] py-3 outline-none transition-all text-[#002B5B] font-bold text-lg placeholder:text-gray-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed">
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                            <!-- Document Details (Custom Premium Select) -->
                            <div class="grid grid-cols-[160px_1fr] md:grid-cols-[200px_1fr] gap-6">
                                <div class="relative group" #docTypeRef>
                                    <label class="block text-[#002B5B] font-extrabold text-[12px] uppercase tracking-widest mb-2 transition-colors group-focus-within:text-[#FF6F61]">{{ lang.t('paso4.doc_type') }} *</label>
                                    <div role="button" tabindex="0" (click)="!isEditing() && toggleDocType()" (keydown.enter)="!isEditing() && toggleDocType()" (keydown.space)="!isEditing() && toggleDocType(); $event.preventDefault()" 
                                         class="w-full border-b-2 border-gray-100 py-3 cursor-pointer flex justify-between items-center group-focus-within:border-[#FF6F61]"
                                         [class.opacity-50]="isEditing()" [class.cursor-not-allowed]="isEditing()">
                                        <span class="font-bold text-lg transition-colors"
                                              [class.text-[#002B5B]]="docTypeTouched()"
                                              [class.text-gray-300]="!docTypeTouched()">
                                            {{ docTypeTouched() ? lang.t(selectedDocType()?.labelKey || '') : lang.t('paso4.doc_type_ph') }}
                                        </span>
                                        <svg class="w-5 h-5 text-gray-400 transition-transform duration-300" [class.rotate-180]="showDocType()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                    
                                    <!-- Premium Custom Document Dropdown -->
                                    <div *ngIf="showDocType()" 
                                         class="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                                        <div class="p-1">
                                            <div *ngFor="let type of documentTypes" 
                                                 (click)="selectDocType(type)"
                                                 class="flex items-center justify-between px-4 py-3 hover:bg-[#FF6F61]/5 rounded-xl cursor-pointer transition-colors group/item">
                                                <span class="text-[#002B5B] font-bold text-sm tracking-tight">{{ lang.t(type.labelKey) }}</span>
                                                <span class="text-[0.6rem] bg-gray-100 text-gray-400 px-2 py-0.5 rounded font-black group-hover/item:bg-[#FF6F61]/10 group-hover/item:text-[#FF6F61] transition-colors uppercase">{{ type.value }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="relative group">
                                    <label class="block text-[#002B5B] font-extrabold text-[12px] uppercase tracking-widest mb-2 transition-colors group-focus-within:text-[#FF6F61]">{{ lang.t('paso4.doc_id') }} *</label>
                                    <input type="text" spellcheck="false" [placeholder]="lang.t('paso4.doc_id_ph')" 
                                           [value]="docNumber()"
                                           [disabled]="isEditing()"
                                           (input)="onDocNumberInput($any($event.target).value)"
                                           (keydown)="onlyNumbers($event)"
                                           class="w-full border-b-2 border-gray-100 focus:border-[#FF6F61] py-3 outline-none transition-all text-[#002B5B] font-bold text-lg placeholder:text-gray-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed">
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3 pt-5 border-t border-gray-100">
                            <label class="flex items-center gap-4 cursor-pointer group">
                                <div class="relative flex items-center justify-center">
                                    <input type="checkbox" class="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 checked:bg-[#002B5B] checked:border-[#002B5B] transition-all">
                                    <svg class="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <span class="text-[0.7rem] text-gray-400 font-bold uppercase tracking-widest group-hover:text-[#002B5B] transition-colors mt-0.5">{{ lang.t('paso4.discounts_opt') }}</span>
                            </label>

                            <label class="flex items-center gap-4 cursor-pointer group">
                                <div class="relative flex items-center justify-center">
                                    <input type="checkbox" checked class="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 checked:bg-[#002B5B] checked:border-[#002B5B] transition-all">
                                    <svg class="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <span class="text-[0.7rem] text-gray-400 font-bold uppercase tracking-widest group-hover:text-[#002B5B] transition-colors mt-0.5" [innerHTML]="lang.t('paso4.privacy_policy')"></span>
                            </label>
                        </div>
                    </form>
                </div>

                <div class="w-full">
                    <app-reservation-ticket [totalAmount]="totalReservationCost()"></app-reservation-ticket>
                </div>

                <button (click)="confirmBooking()" 
                        class="group w-full max-w-lg py-3.5 px-8 rounded-[2rem] bg-gradient-to-r from-[#FF6F61] to-[#FF8A75] text-white font-black tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,111,97,0.3)] hover:shadow-[0_0_40px_rgba(255,111,97,0.5)] hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden text-base md:text-lg flex items-center justify-center gap-3">
                    <span class="relative z-10 flex items-center justify-center gap-3">
                        {{ isEditing() ? lang.t('paso4.update_reservation') : lang.t('paso4.complete_reservation') }}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                    <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                </button>
            </div>

            <!-- Pre-Login Notification Modal -->
            @if(showConfirmModal()) {
                <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002B5B]/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-300 border border-white/20">
                        <div class="p-8 flex flex-col items-center text-center relative z-10">
                            <!-- Icon -->
                            <div class="w-16 h-16 bg-[#002B5B]/5 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#002B5B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>

                            <h3 class="text-2xl font-black text-[#002B5B] mb-2 font-display tracking-tight">{{ lang.t('paso4.notification') }}</h3>
                            <div class="h-1 w-12 bg-[#FF6F61] rounded-full mb-4"></div>
                            
                            <p class="text-slate-600 font-medium leading-relaxed mb-8">
                                {{ lang.t('paso4.notification_desc') }}
                            </p>

                            <button (click)="proceedToLogin()" 
                                    class="w-full py-4 bg-[#002B5B] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-[#003875] hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group">
                                <span>{{ lang.t('paso4.continue') }}</span>
                                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Decorative bg blobs -->
                        <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF6F61]/10 rounded-bl-full -z-0"></div>
                        <div class="absolute bottom-0 left-0 w-24 h-24 bg-[#002B5B]/5 rounded-tr-full -z-0"></div>
                    </div>
                </div>
            }
        </main>
    </div>
  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
  `]
})
export class Paso4Component implements OnInit {
    private bookingService = inject(BookingService);
    private router = inject(Router);
    private apiService = inject(ApiService);
    lang = inject(LanguageService);

    countries = COUNTRIES;

    constructor() {
        effect(() => {
            const user = this.apiService.currentUser();
            if (user) {
                // Find DDI based on nationality if available
                let overrideDDI = '+57';
                if (user.nationality) {
                    const country = this.countries.find(c => c.name === user.nationality);
                    if (country) overrideDDI = country.dialCode;
                }

                // Overwrite form with User Profile Data
                this.bookingService.updateCustomerDetails({
                    fullName: user.name,
                    email: user.email,
                    phone: user.phone,
                    nationality: user.nationality,
                    docType: user.doc_type,
                    docNumber: user.doc_number,
                    ddi: overrideDDI // Set inferred DDI
                });

                // Mark keys as touched so they display correctly
                if (user.nationality) this.nationalityTouched.set(true);
                if (user.doc_type) this.docTypeTouched.set(true);
                if (user.doc_number) this.docNumberTouched.set(true);
                if (user.phone) {
                    this.phoneTouched.set(true);
                    this.ddiTouched.set(true);
                }
                if (user.email) this.emailTouched.set(true);
            }
        }, { allowSignalWrites: true });
    }

    ngOnInit() {
        // Validate Reservation Integrity on Init
        const state = this.bookingService.reservation();
        if (!state.selectedCar || !state.selectedCar.id || !state.pickup.date || !state.dropoff.date) {
            this.router.navigate(['/']);
            return;
        }

        // Restore Touched State from Booking Service Persistence
        const details = state.customerDetails;
        if (details) {
            if (details.nationality) this.nationalityTouched.set(true);
            if (details.ddi) this.ddiTouched.set(true);
            if (details.docType) this.docTypeTouched.set(true);
            if (details.email) this.emailTouched.set(true);
            if (details.phone) this.phoneTouched.set(true);
            if (details.docNumber) this.docNumberTouched.set(true);
        }

        // User pre-fill handled by effect in constructor
    }

    // Form Field Touched States
    emailTouched = signal(false);
    ddiTouched = signal(false);
    nationalityTouched = signal(false);
    docTypeTouched = signal(false);
    phoneTouched = signal(false);
    docNumberTouched = signal(false);

    // Local Signals for Form Syncing
    fullName = computed(() => this.bookingService.reservation().customerDetails?.fullName ?? '');
    emailValue = computed(() => this.bookingService.reservation().customerDetails?.email ?? '');
    phoneNumber = computed(() => this.bookingService.reservation().customerDetails?.phone ?? '');
    documentNumber = computed(() => this.bookingService.reservation().customerDetails?.docNumber ?? '');
    docNumber = computed(() => this.bookingService.reservation().customerDetails?.docNumber ?? '');

    // Nationality State
    showNationality = signal(false);
    selectedNationality = computed(() => {
        const nation = this.bookingService.reservation().customerDetails?.nationality;
        if (!nation || nation === 'Colombia' && !this.nationalityTouched()) return null;
        return this.countries.find(c => c.name === nation) || this.countries[0];
    });
    nationalitySearch = signal('');
    filteredCountries = computed(() => {
        const search = this.nationalitySearch().toLowerCase();
        return this.countries.filter(c => c.name.toLowerCase().includes(search));
    });

    // DDI State
    showDDI = signal(false);
    selectedDDI = computed(() => {
        const ddi = this.bookingService.reservation().customerDetails?.ddi;
        if (!ddi || ddi === '+57' && !this.ddiTouched()) return null;
        return this.countries.find(c => c.dialCode === ddi) || this.countries[0];
    });
    ddiSearch = signal(this.bookingService.reservation().customerDetails?.ddi || '+57');
    filteredDDI = computed(() => {
        const search = this.ddiSearch().toLowerCase();
        return this.countries.filter(c =>
            c.dialCode.toLowerCase().includes(search) ||
            c.name.toLowerCase().includes(search)
        );
    });

    // Document Type State
    showDocType = signal(false);
    documentTypes = [
        { labelKey: 'paso4.doc_cc', value: 'CC' },
        { labelKey: 'paso4.doc_ce', value: 'CE' },
        { labelKey: 'paso4.doc_pas', value: 'PAS' },
        { labelKey: 'paso4.doc_idex', value: 'ID EX' }
    ];
    selectedDocType = computed(() => {
        const type = this.bookingService.reservation().customerDetails?.docType;
        if (!type || type === 'CC' && !this.docTypeTouched()) return null;
        return this.documentTypes.find(t => t.value === type) || this.documentTypes[0];
    });

    // Email validation state
    emailValid = computed(() => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(this.emailValue());
    });

    @ViewChild('nationalityRef') nationalityRef!: ElementRef;
    @ViewChild('ddiRef') ddiRef!: ElementRef;
    @ViewChild('docTypeRef') docTypeRef!: ElementRef;

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
        if (this.nationalityRef && !this.nationalityRef.nativeElement.contains(event.target)) {
            this.showNationality.set(false);
        }
        if (this.ddiRef && !this.ddiRef.nativeElement.contains(event.target)) {
            this.showDDI.set(false);
        }
        if (this.docTypeRef && !this.docTypeRef.nativeElement.contains(event.target)) {
            this.showDocType.set(false);
        }
    }

    toggleNationality() {
        this.showNationality.update(v => !v);
        this.showDDI.set(false);
        this.showDocType.set(false);
        if (!this.showNationality()) this.nationalitySearch.set('');
    }

    toggleDDI() {
        this.showDDI.update(v => !v);
        this.showNationality.set(false);
        this.showDocType.set(false);
        if (!this.showDDI()) this.ddiSearch.set('');
    }

    toggleDocType() {
        this.showDocType.update(v => !v);
        this.showNationality.set(false);
        this.showDDI.set(false);
    }

    selectNationality(country: Country) {
        this.nationalityTouched.set(true);
        this.bookingService.updateCustomerDetails({ nationality: country.name });
        this.showNationality.set(false);
        this.nationalitySearch.set('');
    }

    selectDDI(country: Country) {
        this.ddiTouched.set(true);
        this.bookingService.updateCustomerDetails({ ddi: country.dialCode });
        this.ddiSearch.set(country.dialCode);
        this.showDDI.set(false);
    }

    selectDocType(type: any) {
        this.docTypeTouched.set(true);
        this.bookingService.updateCustomerDetails({ docType: type.value });
        this.showDocType.set(false);
    }

    filterNationality(val: string) {
        this.nationalitySearch.set(val);
    }

    filterDDI(val: string) {
        // Enforce digits only and max 2 numbers
        let cleaned = val.replace(/\D/g, '');
        if (cleaned.length > 2) cleaned = cleaned.substring(0, 2);
        const newVal = cleaned ? '+' + cleaned : '';
        this.ddiSearch.set(newVal);
        // Also update prefix in background if it's a valid match? 
        // For now, only update on selection or leave as is.
        this.bookingService.updateCustomerDetails({ ddi: newVal });
    }

    onFullNameInput(val: string) {
        this.bookingService.updateCustomerDetails({ fullName: val });
    }

    onEmailInput(val: string) {
        this.bookingService.updateCustomerDetails({ email: val });
    }

    onPhoneInput(val: string) {
        this.bookingService.updateCustomerDetails({ phone: val });
    }

    onDocNumberInput(val: string) {
        this.bookingService.updateCustomerDetails({ docNumber: val });
    }

    onDDIBlur() {
        // Small timeout to allow the click on the dropdown list to register
        setTimeout(() => {
            if (!this.ddiSearch()) {
                const currentDDI = this.selectedDDI();
                this.ddiSearch.set(currentDDI ? currentDDI.dialCode : '+57');
            }
            this.showDDI.set(false);
        }, 200);
    }

    onlyNumbers(event: KeyboardEvent) {
        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
        if (allowedKeys.includes(event.key)) return;
        if (!/^\d$/.test(event.key)) {
            event.preventDefault();
        }
    }

    // Reservation Logic (Duplicated from Paso 3 for consistency)
    selectedCar = computed(() => this.bookingService.reservation().selectedCar);
    selectedInsurance = computed(() => this.bookingService.reservation().insurance);

    totalReservationCost = computed(() => {
        return this.bookingService.calculateTotalValue();
    });

    isSubmitting = signal(false);

    // --- EDIT MODE ---
    isEditing = computed(() => !!this.bookingService.editingBookingId());

    // Confirm Modal State
    showConfirmModal = signal(false);

    proceedToLogin() {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/paso-4' } });
    }

    confirmBooking() {
        this.emailTouched.set(true);
        this.ddiTouched.set(true);
        this.docTypeTouched.set(true);
        this.phoneTouched.set(true);
        this.docNumberTouched.set(true);
        this.nationalityTouched.set(true);

        if (!this.emailValid() || !this.selectedDDI() || !this.phoneNumber() || !this.selectedDocType() || !this.documentNumber()) {
            alert(this.lang.t('paso4.alert_complete_fields'));
            return;
        }

        // Save current form state to service before any redirection
        this.bookingService.updateCustomerDetails({
            fullName: this.fullName(),
            email: this.emailValue(),
            phone: this.phoneNumber(),
            ddi: this.selectedDDI()?.dialCode,
            docType: this.selectedDocType()?.value,
            docNumber: this.documentNumber(),
            nationality: this.selectedNationality()?.name
        });

        this.isSubmitting.set(true);

        // Check Login before creating booking
        if (!this.apiService.currentUser()) {
            this.showConfirmModal.set(true);
            this.isSubmitting.set(false);
            return;
        }

        // Prepare Payload
        const state = this.bookingService.reservation();

        if (!state.selectedCar || !state.selectedCar.id || !state.pickup.date || !state.dropoff.date) {
            alert(this.lang.t('paso4.alert_session_expired'));
            this.router.navigate(['/']);
            return;
        }

        // Generate random booking code BEFORE sending.
        const bookingCode = this.generateBookingCode();

        const payload = {
            category_id: state.selectedCar?.id,
            start_date: this.formatDateForAPI(state.pickup.date!),
            end_date: this.formatDateForAPI(state.dropoff.date!),
            total_price: this.totalReservationCost(),
            daily_rate: Number(state.selectedCar?.base_price || state.selectedCar?.price || state.selectedCar?.priceLowSeason || 0),
            pickup_location: state.pickup.city,
            dropoff_location: state.dropoff.city || state.pickup.city,
            insurance: state.insurance,
            pickup_time: state.pickup.time,
            dropoff_time: state.dropoff.time,
            status: 'confirmed',
            code: bookingCode,

            // Database Fields for Contact Info
            customer_name: this.fullName(),
            customer_email: this.emailValue(),
            customer_phone: this.phoneNumber(),
            customer_phone_code: this.selectedDDI()?.dialCode,
            customer_doc_type: this.selectedDocType()?.value,
            customer_doc_number: this.documentNumber(),
            customer_nationality: this.selectedNationality()?.name,

            customerDetails: {
                ...state.customerDetails,
                fullName: this.fullName(),
                nationality: this.selectedNationality()?.name,
                email: this.emailValue(),
                ddi: this.selectedDDI()?.dialCode,
                phone: this.phoneNumber(),
                docType: this.selectedDocType()?.value,
                docNumber: this.documentNumber()
            }
        };

        if (this.isEditing()) {
            const bookingId = this.bookingService.editingBookingId();
            if (!bookingId) return;

            this.apiService.updateBooking(bookingId, payload).subscribe({
                next: (res) => {
                    this.isSubmitting.set(false);
                    // Clear edit mode
                    this.bookingService.cancelEditing();
                    alert(this.lang.t('general.updateSuccess'));
                    this.router.navigate(['/reservas']);
                },
                error: (err) => {
                    this.isSubmitting.set(false);
                    console.error(err);
                    alert(this.lang.t('general.updateError'));
                }
            });
        } else {
            this.apiService.createBooking(payload).subscribe({
                next: (res) => {
                    this.isSubmitting.set(false);
                    if (res.user_token) {
                        localStorage.setItem('token', res.user_token);
                    }

                    // Authorize access to confirmation page
                    this.bookingService.setLastBookedCode(bookingCode);

                    // Use the code we generated and sent
                    this.router.navigate(['/paso-5', bookingCode]);
                },
                error: (err) => {
                    this.isSubmitting.set(false);
                    if (err.error?.error === 'REQUIRE_LOGIN') {
                        this.router.navigate(['/login'], { queryParams: { returnUrl: '/paso-4' } });
                        return;
                    }
                    alert('Error al reservar: ' + (err.error?.error || 'Unknown'));
                }
            });
        }
    }

    private generateBookingCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    private formatDateForAPI(date: Date): string {
        // YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
