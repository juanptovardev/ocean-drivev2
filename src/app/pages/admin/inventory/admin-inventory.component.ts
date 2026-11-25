import { Component, ChangeDetectionStrategy, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CalendarComponent } from '../../../../components/calendar/calendar.component';

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
    selector: 'app-admin-inventory',
    standalone: true,
    imports: [CommonModule, FormsModule, CalendarComponent],
    template: `
    <div class="font-sans text-slate-800">
        <style>
            .apple-date-input::-webkit-calendar-picker-indicator,
            .apple-time-input::-webkit-calendar-picker-indicator {
                background: transparent;
                bottom: 0;
                color: transparent;
                cursor: pointer;
                height: auto;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;
                width: auto;
            }
            .text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.05); }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .animate-fade-in { animation: fadeIn 0.15s ease-out forwards; }
            .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        </style>



        <!-- Grid de Vehículos / Categorías -->
        <div class="w-full mx-auto pb-20 md:pb-0">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                @for (vehicle of vehicles(); track vehicle.id) {
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden h-[200px] flex flex-col justify-between"
                         (click)="openCategoryDetail(vehicle)">
                        
                        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform"></div>

                        <div class="relative z-10 flex flex-col h-full">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex flex-col max-w-[65%]">
                                    <h4 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest leading-none text-shadow-sm mb-2">
                                        {{ vehicle.name }}
                                    </h4>
                                    <div class="w-10 h-0.5 bg-slate-100 mb-2"></div>
                                    <p class="text-slate-700 text-[10px] italic line-clamp-2 leading-relaxed" [title]="vehicle.description">
                                        {{ vehicle.description || 'Sin descripción' }}
                                    </p>
                                </div>
                                
                                <div class="text-right flex flex-col items-end">
                                     <div class="flex items-center gap-2 mb-0.5">
                                         <span class="text-[9px] font-bold uppercase tracking-wider" 
                                               [class.text-blue-500]="vehicle.category_status === 'booked'"
                                               [class.text-orange-500]="vehicle.category_status === 'maintenance'"
                                               [class.text-slate-700]="vehicle.category_status === 'available' && !vehicle.is_special_price"
                                               [class.text-emerald-500]="vehicle.category_status === 'available' && vehicle.is_special_price">
                                             @if (vehicle.category_status === 'booked') {
                                                 Reservados
                                             } @else if (vehicle.category_status === 'maintenance') {
                                                 Mantenimiento
                                             } @else {
                                                 {{ vehicle.is_special_price ? 'Temporada: ' + (vehicle.season_name || '') : 'Base / Día' }}
                                             }
                                         </span>
                                         <span class="w-2 h-2 rounded-full ring-1 ring-white shadow-sm"
                                              [class.bg-blue-500]="vehicle.category_status === 'booked'" 
                                              [class.bg-orange-500]="vehicle.category_status === 'maintenance'"
                                              [class.bg-green-500]="vehicle.category_status === 'available'">
                                        </span>
                                     </div>
                                     <div class="text-base font-bold text-slate-700 tracking-tight" 
                                          [class.text-blue-600]="vehicle.category_status === 'booked' || vehicle.is_special_price">
                                         {{ (vehicle.current_price || 0) | currency:'COP':'symbol':'1.0-0' }}
                                     </div>
                                </div>
                            </div>

                            <div class="flex-1"></div>

                            <div class="grid grid-cols-4 gap-2 border-t border-slate-50 pt-3 text-center">
                                <div class="flex flex-col">
                                     <span class="text-lg font-bold text-slate-800 leading-none">{{ vehicle.stock || 0 }}</span>
                                     <span class="text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-1">Unidades</span>
                                </div>
                                <div class="flex flex-col">
                                     <span class="text-lg font-bold text-green-600 leading-none">{{ vehicle.available_count || 0 }}</span>
                                     <span class="text-[9px] font-bold text-green-400 uppercase tracking-widest mt-1">Disp.</span>
                                </div>
                                <div class="flex flex-col">
                                     <span class="text-lg font-bold text-blue-600 leading-none">{{ vehicle.active_bookings_count || 0 }}</span>
                                     <span class="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">Activas</span>
                                </div>
                                <div class="flex flex-col">
                                     <span class="text-lg font-bold text-slate-800 leading-none">{{ vehicle.month_bookings_count || 0 }}</span>
                                     <span class="text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-1" title="Reservas activas durante el mes actual">RES Mes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                <!-- Add Category Button -->
                <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-blue-300 transition-all cursor-pointer group h-[200px] shadow-sm hover:shadow-md"
                     (click)="openCreateCategoryModal()">
                    <div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div class="text-center">
                        <span class="text-[10px] font-black text-slate-700 uppercase tracking-widest group-hover:text-slate-800 transition-colors block">Nueva Categoría</span>
                        <span class="text-[9px] text-slate-300 font-medium italic mt-1 block">Añadir modelo de flota</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Crear Categoría -->
        @if (showCreateCategoryModal()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                 (click)="showCreateCategoryModal.set(false)">
                <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
                     (click)="$event.stopPropagation()">
                    
                    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <h3 class="text-2xl font-black text-slate-800 uppercase tracking-widest">{{ isEditingCategory() ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA' }}</h3>
                        </div>
                        <button aria-label="Cerrar" (click)="showCreateCategoryModal.set(false)" class="text-slate-700 hover:text-slate-800 transition-colors">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div class="p-6 overflow-y-auto max-h-[70vh]">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column: Name & Image -->
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nombre de la Categoría *</label>
                                    <input type="text" [(ngModel)]="newCategoryForm.name" placeholder="Ej: Luxury"
                                           class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                </div>
                            
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Imagen del Vehículo (.webp)</label>
                                    <div class="relative">
                                        <input type="file" (change)="onCategoryFileSelected($event)" accept=".webp"
                                               class="hidden" #fileInput>
                                        <div role="button" tabindex="0" (click)="fileInput.click()" (keydown.enter)="fileInput.click()" (keydown.space)="fileInput.click(); $event.preventDefault()" 
                                             class="w-full px-4 h-[46px] bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-all">
                                            <span class="text-xs font-bold truncate pr-3" 
                                                  [class.text-slate-700]="!selectedCategoryFile && !newCategoryForm.image_url" 
                                                  [class.text-blue-600]="selectedCategoryFile || newCategoryForm.image_url">
                                                @if (selectedCategoryFile) {
                                                    {{ selectedCategoryFile.name }}
                                                } @else if (newCategoryForm.image_url && newCategoryForm.image_url !== '') {
                                                    {{ newCategoryForm.image_url.split('/').pop() }}
                                                } @else {
                                                    Seleccionar archivo .webp
                                                }
                                            </span>
                                            <div class="flex items-center gap-2 shrink-0">
                                                @if (selectedCategoryFile || newCategoryForm.image_url) {
                                                    <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                }
                                                <svg class="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column: Price & Details -->
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Precio Base (Por Día) *</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-bold text-xs">$</span>
                                        <input type="number" [(ngModel)]="newCategoryForm.base_price"
                                               class="w-full pl-7 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Pasajeros</label>
                                        <input type="number" [(ngModel)]="newCategoryForm.passengers"
                                               class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Maletas</label>
                                        <input type="number" [(ngModel)]="newCategoryForm.luggage"
                                               class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Transmisión</label>
                                        <div class="relative">
                                            <button (click)="transmissionDropdownOpen.set(!transmissionDropdownOpen())" 
                                                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 flex items-center justify-between hover:border-blue-400 hover:bg-white transition-all focus:ring-4 focus:ring-blue-500/10 shadow-sm">
                                                <span>{{ newCategoryForm.transmission }}</span>
                                                <svg class="w-4 h-4 text-slate-700 transition-transform duration-300" [class.rotate-180]="transmissionDropdownOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            
                                            @if (transmissionDropdownOpen()) {
                                                <div class="fixed inset-0 z-[100]" (click)="transmissionDropdownOpen.set(false)"></div>
                                                <div class="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-[101] overflow-hidden animate-scale-in origin-top">
                                                    <div role="button" tabindex="0" (click)="newCategoryForm.transmission = 'Automático'; transmissionDropdownOpen.set(false)" (keydown.enter)="newCategoryForm.transmission = 'Automático'; transmissionDropdownOpen.set(false)" (keydown.space)="newCategoryForm.transmission = 'Automático'; transmissionDropdownOpen.set(false); $event.preventDefault()" 
                                                         class="px-4 py-3 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-all flex items-center justify-between"
                                                         [class.bg-blue-50]="newCategoryForm.transmission === 'Automático'"
                                                         [class.text-blue-700]="newCategoryForm.transmission === 'Automático'">
                                                        <span>Automático</span>
                                                        @if(newCategoryForm.transmission === 'Automático') {
                                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                                                        }
                                                    </div>
                                                    <div (click)="newCategoryForm.transmission = 'Manual'; transmissionDropdownOpen.set(false)" 
                                                         class="px-4 py-3 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-all border-t border-slate-50 flex items-center justify-between"
                                                         [class.bg-blue-50]="newCategoryForm.transmission === 'Manual'"
                                                         [class.text-blue-700]="newCategoryForm.transmission === 'Manual'">
                                                        <span>Manual</span>
                                                        @if(newCategoryForm.transmission === 'Manual') {
                                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Temporadas Especiales (Full Width) -->
                            <div class="col-span-1 md:col-span-2">
                                <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                     <div class="flex items-center gap-2 mb-3">
                                         <div class="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                                             <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                         </div>
                                         <h4 class="text-xs font-black text-blue-800 uppercase tracking-widest">Temporadas Especiales</h4>
                                     </div>

                                     <div class="space-y-2">
                                         @if (specialPeriods().length === 0) {
                                             <div class="text-center py-6 border-2 border-dashed border-blue-100/50 rounded-lg bg-white/50 flex flex-col items-center justify-center gap-1.5 group cursor-pointer hover:bg-blue-50/30 transition-colors" (click)="addSpecialPeriod()">
                                                 <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                     <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                 </div>
                                                 <p class="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Agregar Temporada</p>
                                             </div>
                                         }
                                         @for(period of specialPeriods(); track $index) {
                                             <div class="bg-white p-3 rounded-lg border border-blue-100 relative group hover:border-blue-300 transition-colors shadow-sm">
                                                 <button aria-label="Eliminar período" (click)="removeSpecialPeriod($index)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10">
                                                     <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                 </button>

                                                 <div class="mb-2">
                                                     <label class="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre (Ej: Semana Santa)</label>
                                                     <input type="text" [(ngModel)]="period.name" placeholder="Fin de año, Vacaciones..."
                                                            class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-300">
                                                 </div>

                                                 <div class="grid grid-cols-3 gap-2">
                                                     <div>
                                                         <label class="block text-[8px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">Desde</label>
                                                         <div class="relative">
                                                             <button type="button" (click)="toggleCalendar($index, 'start', $event)"
                                                                   class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-800 flex items-center justify-between hover:bg-slate-100 focus:outline-none focus:border-blue-500 transition-all">
                                                                 <span>{{ period.start ? (getPeriodDate(period.start) | date:'dd/MM/yyyy') : 'dd/mm/aaaa' }}</span>
                                                                 <svg class="w-3 h-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                             </button>
                                                             
                                                             @if (isCalendarOpen($index, 'start')) {
                                                                 <div class="fixed inset-0 z-[200]" (click)="activeCalendar.set(null)"></div>
                                                                 <div class="absolute bottom-full left-0 mb-1 z-[201] w-64 shadow-xl rounded-xl overflow-hidden border border-slate-100 bg-white" (click)="$event.stopPropagation()">
                                                                     <app-calendar 
                                                                         [date]="getPeriodDate(period.start)"
                                                                         [minDate]="getMinStartDate($index)"
                                                                         [disabledRanges]="getUnavailableRanges($index)"
                                                                         (dateSelected)="setPeriodDate($index, 'start', $event)">
                                                                     </app-calendar>
                                                                 </div>
                                                             }
                                                         </div>
                                                     </div>
                                                     <div>
                                                         <label class="block text-[8px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">Hasta</label>
                                                         <div class="relative">
                                                             <button type="button" (click)="toggleCalendar($index, 'end', $event)"
                                                                   class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-800 flex items-center justify-between hover:bg-slate-100 focus:outline-none focus:border-blue-500 transition-all">
                                                                  <span>{{ period.end ? (getPeriodDate(period.end) | date:'dd/MM/yyyy') : 'dd/mm/aaaa' }}</span>
                                                                  <svg class="w-3 h-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                             </button>

                                                             @if (isCalendarOpen($index, 'end')) {
                                                                 <div class="fixed inset-0 z-[200]" (click)="activeCalendar.set(null)"></div>
                                                                 <div class="absolute bottom-full right-0 mb-1 z-[201] w-64 shadow-xl rounded-xl overflow-hidden border border-slate-100 bg-white" (click)="$event.stopPropagation()">
                                                                     <app-calendar 
                                                                         [date]="getPeriodDate(period.end)"
                                                                         [minDate]="getPeriodDate(period.start) || getMinStartDate($index)"
                                                                         [disabledRanges]="getUnavailableRanges($index)"
                                                                         (dateSelected)="setPeriodDate($index, 'end', $event)">
                                                                     </app-calendar>
                                                                 </div>
                                                             }
                                                         </div>
                                                     </div>
                                                     <div>
                                                         <label class="block text-[8px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">Precio Diario</label>
                                                         <div class="relative">
                                                             <span class="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-[9px]">$</span>
                                                             <input type="number" [(ngModel)]="period.price" placeholder="0"
                                                                    class="w-full pl-5 pr-1 py-1.5 bg-blue-50 border border-blue-200 rounded text-[10px] font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all">
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         }
                                         @if (specialPeriods().length > 0) {
                                            <div class="mt-2 flex justify-center">
                                                <div class="px-3 py-1.5 border border-dashed border-blue-200 rounded-lg bg-white/50 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-blue-50 transition-colors group" (click)="addSpecialPeriod()">
                                                    <svg class="w-4 h-4 text-blue-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                                    <span class="text-[9px] font-bold text-slate-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Agregar Otra Temporada</span>
                                                </div>
                                            </div>
                                         }
                                     </div>
                                </div>
                            </div>
                            
                            <!-- Description (Full Width) -->
                            <div class="col-span-1 md:col-span-2">
                                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Descripción</label>
                                <textarea [(ngModel)]="newCategoryForm.description" rows="2" placeholder="Mercedes, Bwm, audi, etc."
                                          class="w-full px-4 py-2 h-[72px] bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"></textarea>
                            </div>
                        </div> <!-- Close Grid -->
                    </div> <!-- Close Modal Body -->

                    <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button (click)="showCreateCategoryModal.set(false)" 
                                class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider">Cancelar</button>
                        <button (click)="saveCategory()" [disabled]="categoryLoading()"
                                class="px-8 py-3 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2">
                            @if (categoryLoading()) {
                                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                CREANDO...
                            } @else {
                                <span>GUARDAR CATEGORÍA</span>
                            }
                        </button>
                    </div>
                </div>

            </div>
        }

        <!-- Modal de Detalle de Categoría (Unidades/Calendario) -->
        @if (selectedVehicle()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                 (click)="closeCategoryDetail()">
                <div class="bg-white w-full max-w-[85rem] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up"
                     (click)="$event.stopPropagation()">
                    
                    <!-- Header -->
                    <div class="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 class="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide truncate">
                                <span class="text-blue-600">#</span> {{ selectedVehicle().name }}
                            </h3>
                        </div>
                        <div class="flex items-center gap-6">
                            <span class="hidden md:block text-sm font-bold text-slate-700 uppercase tracking-wider">Gestión de Unidades</span>
                            
                            <div class="relative">
                                <button aria-label="Menú de categoría" (click)="categoryMenuOpen.set(!categoryMenuOpen())" 
                                        class="p-2 hover:bg-white rounded-full transition-colors text-slate-700 hover:text-slate-800 shadow-sm border border-transparent hover:border-slate-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                                
                                @if (categoryMenuOpen()) {
                                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fade-in">
                                        <button (click)="editCategory()" 
                                                class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            EDITAR CATEGORÍA
                                        </button>
                                        <div class="border-t border-slate-100 my-1"></div>
                                        <button (click)="deleteCategory()" 
                                                class="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            ELIMINAR CATEGORÍA
                                        </button>
                                    </div>
                                }
                            </div>

                            <button aria-label="Cerrar" (click)="closeCategoryDetail()" class="p-2 hover:bg-white rounded-full transition-colors text-slate-700 hover:text-slate-800 shadow-sm border border-transparent hover:border-slate-100">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <!-- Panel Izquierdo: Lista de Unidades -->
                        <div class="w-full md:w-1/4 border-r border-slate-100 flex flex-col bg-white">
                            <div class="p-4 border-b border-slate-100 bg-slate-50/50">
                                <button (click)="openCreateModal()" 
                                        class="w-full bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                                    </svg>
                                    NUEVO VEHÍCULO
                                </button>
                            </div>

                            <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
                                <div *ngIf="instancesLoading()" class="p-8 text-center text-slate-700 text-sm">Cargando...</div>
                                <div class="space-y-2">
                                    @for (instance of instances(); track instance.id) {
                                        <div (click)="selectInstance(instance)" 
                                             class="px-4 py-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-blue-100 group relative"
                                             [class.bg-blue-50]="selectedInstance()?.id === instance.id"
                                             [class.border-blue-200]="selectedInstance()?.id === instance.id">
                                            
                                            <div class="flex justify-between items-center">
                                                <div class="flex items-baseline gap-2">
                                                    <span class="text-base font-black text-slate-800 tracking-tight">{{ instance.identifier || instance.plate || 'S/P' }}</span>
                                                </div>

                                                <div class="flex items-center gap-3">
                                                    <div class="text-[10px] font-bold text-right leading-tight">
                                                        <div [class]="getStatusColor(instance.current_status)">{{ instance.status_label }}</div>
                                                        <div class="text-slate-700 font-normal whitespace-pre">{{ getStatusSubtitle(instance) }}</div>
                                                    </div>
                                                    <span class="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white"
                                                       [class.bg-green-500]="instance.current_status === 'available'" 
                                                       [class.bg-blue-500]="instance.current_status === 'booked'"
                                                       [class.bg-orange-400]="instance.current_status === 'maintenance'">
                                                    </span>

                                                    <!-- Menu Dot Button -->
                                                    <div class="relative">
                                                        <button aria-label="Menú de vehículo" (click)="toggleInstanceMenu(instance.id, $event, instance)" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-colors text-slate-700 hover:text-slate-800 focus:outline-none">
                                                             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                                        </button>
                                                        
                                                        @if (activeInstanceMenu() === instance.id) {
                                                             <!-- Backdrop -->
                                                            <div class="fixed inset-0 z-30 cursor-default" (click)="closeInstanceMenu(); $event.stopPropagation()"></div>
                                                            <!-- Dropdown -->
                                                            <div class="absolute top-8 right-0 z-40 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl w-36 py-1 overflow-hidden animate-scale-in origin-top-right flex flex-col" (click)="$event.stopPropagation()">
                                                                 <button class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors bg-transparent w-full text-left mt-1" (click)="openEditRatesModal(instance)">
                                                                     <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                     Lavada
                                                                 </button>
                                                                 <button class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors bg-transparent w-full text-left mt-px border-t border-slate-50" (click)="deleteInstance(instance)">
                                                                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                     Eliminar
                                                                 </button>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <!-- Panel Derecho: Calendario -->
                        <div id="inventoryRightPanel" class="w-full md:w-3/4 bg-slate-50 p-6 overflow-y-auto">
                            @if (selectedInstance()) {
                                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
                                    <!-- Header Calendario -->
                                    <!-- Header Calendario (Updated to match Main Board) -->
                                    <div class="flex justify-between items-center mb-2 pl-1">
                                        <h4 class="text-2xl font-black uppercase tracking-widest flex items-center gap-3"
                                            [class]="getStatusColor(selectedInstance().current_status)">
                                            <span class="w-2.5 h-2.5 rounded-full"
                                                  [class.bg-green-500]="selectedInstance().current_status === 'available'" 
                                                  [class.bg-blue-500]="selectedInstance().current_status === 'booked'"
                                                  [class.bg-orange-400]="selectedInstance().current_status === 'maintenance'">
                                            </span>
                                            {{ selectedInstance().identifier || selectedInstance().plate }}
                                        </h4>
                                        <!-- Navigation -->
                                        <!-- Navigation -->
                                        <div class="flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-sm gap-2">
                                            <!-- Arrows & Refresh -->
                                            <div class="flex items-center gap-1">
                                                <button (click)="refreshCurrentBooking()" class="p-1.5 hover:bg-slate-50 rounded-md text-slate-700 hover:text-blue-600 transition-colors" title="Recargar Calendario">
                                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </button>
                                                <div class="w-px h-4 bg-slate-200 mx-1"></div>
                                                <button aria-label="Vista anterior" (click)="navigateView(-1)" class="p-1.5 hover:bg-slate-50 rounded-md text-slate-700 hover:text-slate-800 transition-colors">
                                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                                                </button>
                                                <button aria-label="Vista siguiente" (click)="navigateView(1)" class="p-1.5 hover:bg-slate-50 rounded-md text-slate-700 hover:text-slate-800 transition-colors">
                                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            </div>
                                            
                                            <div class="w-px h-5 bg-slate-200 mx-1"></div>

                                            <!-- View Selectors -->
                                            <div class="flex items-center gap-1">
                                                 <button (click)="setViewMode('month')" 
                                                         class="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
                                                         [ngClass]="viewMode() === 'month' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-slate-800 hover:bg-slate-50'">
                                                     {{ currentMonthName() }}
                                                 </button>
                                                 <button (click)="setViewMode('quarter')"
                                                         class="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all hidden md:block"
                                                         [ngClass]="viewMode() === 'quarter' ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-700 hover:text-slate-800 hover:bg-slate-50'">
                                                     TRIMESTRAL
                                                 </button>
                                                 <button (click)="setViewMode('semester')"
                                                         class="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all hidden md:block"
                                                         [ngClass]="viewMode() === 'semester' ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-700 hover:text-slate-800 hover:bg-slate-50'">
                                                     SEMESTRAL
                                                 </button>
                                            </div>

                                            <div class="w-px h-5 bg-slate-200 mx-1 hidden md:block"></div>
                                            
                                            <!-- Filter -->
                                            <div class="relative ml-1 pl-1 border-l border-slate-200">
                                                <button aria-label="Filtros de calendario" (click)="showCalendarFilters.set(!showCalendarFilters())" class="p-1.5 rounded-md text-slate-700 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all">
                                                     <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                                </button>

                                                @if (showCalendarFilters()) {
                                                    <div class="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4 animate-scale-in" (click)="$event.stopPropagation()">
                                                        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                                                             <h4 class="text-xs font-black text-slate-800 uppercase tracking-wide">Filtros de Calendario</h4>
                                                             <button aria-label="Cerrar filtros" (click)="showCalendarFilters.set(false)" class="text-slate-700 hover:text-slate-800"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                        </div>
                                                        
                                                        <div class="space-y-4">
                                                            <!-- Toggles -->
                                                             <div class="space-y-1.5">
                                                                 <label class="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block ml-0.5">Visibilidad de Eventos</label>
                                                                 
                                                                 <!-- Retiros Toggle -->
                                                                 <div (click)="showPickups.set(!showPickups())" class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-slate-50 group select-none" [class.bg-green-50]="showPickups()" [class.border-green-100]="showPickups()">
                                                                     <div class="flex items-center gap-2.5">
                                                                         <div class="w-6 h-6 rounded-md flex items-center justify-center transition-colors" [class.bg-green-500]="showPickups()" [class.bg-slate-200]="!showPickups()">
                                                                             <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                                                         </div>
                                                                         <span class="text-[10px] font-bold uppercase transition-colors" [class.text-green-800]="showPickups()" [class.text-slate-500]="!showPickups()">Retiros (Inicio)</span>
                                                                     </div>
                                                                     <div class="w-8 h-4 bg-slate-200 rounded-full relative transition-colors" [class.bg-green-500]="showPickups()">
                                                                         <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm" [class.translate-x-4]="showPickups()"></div>
                                                                     </div>
                                                                 </div>
    
                                                                 <!-- Entregas Toggle -->
                                                                 <div (click)="showDropoffs.set(!showDropoffs())" class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-slate-50 group select-none" [class.bg-red-50]="showDropoffs()" [class.border-red-100]="showDropoffs()">
                                                                     <div class="flex items-center gap-2.5">
                                                                         <div class="w-6 h-6 rounded-md flex items-center justify-center transition-colors" [class.bg-red-500]="showDropoffs()" [class.bg-slate-200]="!showDropoffs()">
                                                                             <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                                                         </div>
                                                                         <span class="text-[10px] font-bold uppercase transition-colors" [class.text-red-800]="showDropoffs()" [class.text-slate-500]="!showDropoffs()">Entregas (Fin)</span>
                                                                     </div>
                                                                     <div class="w-8 h-4 bg-slate-200 rounded-full relative transition-colors" [class.bg-red-500]="showDropoffs()">
                                                                         <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm" [class.translate-x-4]="showDropoffs()"></div>
                                                                     </div>
                                                                 </div>
    
                                                                 <!-- Mantenimiento Toggle -->
                                                                 <div (click)="showMaintenance.set(!showMaintenance())" class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-slate-50 group select-none" [class.bg-orange-50]="showMaintenance()" [class.border-orange-100]="showMaintenance()">
                                                                     <div class="flex items-center gap-2.5">
                                                                          <div class="w-6 h-6 rounded-md flex items-center justify-center transition-colors" [class.bg-orange-500]="showMaintenance()" [class.bg-slate-200]="!showMaintenance()">
                                                                             <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                         </div>
                                                                         <span class="text-[10px] font-bold uppercase transition-colors" [class.text-orange-800]="showMaintenance()" [class.text-slate-500]="!showMaintenance()">Mantenimiento</span>
                                                                     </div>
                                                                     <div class="w-8 h-4 bg-slate-200 rounded-full relative transition-colors" [class.bg-orange-500]="showMaintenance()">
                                                                         <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm" [class.translate-x-4]="showMaintenance()"></div>
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Grid Calendario -->
                                    <div class="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                                        @for(dayName of ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']; track $index) {
                                            <div class="bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-700 uppercase">{{ dayName }}</div>
                                        }
                                        @for (day of calendarDaysComputed(); track $index) {
                                            <div class="min-h-[80px] bg-white p-1 flex flex-col group" [class.bg-slate-50]="day.isOtherMonth">
                                                <span class="text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                                                      [class.bg-slate-900]="day.isToday" [class.text-white]="day.isToday" [class.text-slate-700]="!day.isToday">
                                                    {{ day.dayNum }}
                                                </span>
                                                <div class="mt-1 space-y-0.5">
                                                    @for (event of day.events; track $index) {
                                                        <div class="px-1 py-0.5 rounded text-[8px] font-bold truncate cursor-pointer transition-all"
                                                             (click)="onEventClick(event)"
                                                             [ngClass]="getEventClass(event)">
                                                            {{ event.title }}
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    
                                    <!-- Legend -->
                                    <div class="flex gap-4 mt-4 pt-3 border-t border-slate-50">
                                        <span class="text-[9px] font-bold text-slate-700 uppercase flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Retiro</span>
                                        <span class="text-[9px] font-bold text-slate-700 uppercase flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Entrega</span>
                                        <span class="text-[9px] font-bold text-slate-700 uppercase flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Reserva</span>
                                        <span class="text-[9px] font-bold text-slate-700 uppercase flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Mant.</span>
                                    </div>
                                </div>

                                <!-- Acciones de Gestión (Premium Design) -->
                                <div class="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 items-start h-full"> 
                                    <!-- Left Panel: Event Detail (Viewer) - Matching Overview Modal Style -->
                                    <div class="bg-white rounded-2xl shadow-sm h-full relative border border-slate-200 overflow-hidden flex flex-col">
                                        <!-- If event is selected -->
                                        @if(selectedCalendarEvent()?.data; as b) {
                                            
                                             <!-- Header -->
                                             <div class="px-5 py-4 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center bg-slate-50/50 shrink-0 gap-2">
                                                 <h2 class="text-xl font-black text-slate-800 uppercase tracking-widest">{{ b.category_name || selectedVehicle()?.name }}</h2>
                                                 
                                                 <div class="flex items-center gap-2 self-end xl:self-auto">
                                                     <div class="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm mr-1">
                                                         <button (click)="refreshCurrentBooking()" class="p-1.5 hover:bg-slate-50 rounded text-slate-700 hover:text-blue-600 transition-colors" title="Recargar Reserva">
                                                             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                         </button>
                                                         <button (click)="openEditModal(b, 'view')" 
                                                                 class="p-1.5 hover:bg-slate-50 rounded text-slate-700 hover:text-blue-600 transition-colors" 
                                                                 [title]="(isBookingPast(b) || b.status === 'cancelled') ? 'Ver Detalles' : 'Editar Reserva'">
                                                             @if(isBookingPast(b) || b.status === 'cancelled') {
                                                                 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                             } @else {
                                                                 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                             }
                                                         </button>
                                                         @if(!isBookingPast(b) && b.status !== 'cancelled') {
                                                             <button (click)="cancelCurrentBooking(b)" class="flex items-center gap-1 px-2 py-1.5 hover:bg-red-50 rounded text-slate-700 hover:text-red-600 transition-colors group" title="Cancelar Reserva">
                                                                 <svg class="w-4 h-4 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                                 <span class="text-[10px] font-bold hidden xl:inline">Cancelar</span>
                                                             </button>
                                                         }
                                                     </div>
                                                     @if(b.status !== 'maintenance') {
                                                         <span class="text-[10px] font-bold text-white bg-slate-900 px-2 py-1.5 rounded shadow-sm tracking-widest uppercase font-mono leading-none">
                                                             {{ b.code || b.plate || 'ID: ' + b.id }}
                                                         </span>
                                                     }
                                                    <span class="text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider leading-none"
                                                          [ngClass]="{
                                                              'bg-red-100 text-red-700': isBookingPast(b) || b.status === 'cancelled',
                                                              'bg-blue-100 text-blue-700': !isBookingPast(b) && (b.status === 'pending' || b.status === 'booked'),
                                                              'bg-green-100 text-green-700': !isBookingPast(b) && (b.status === 'confirmed' || b.status === 'available'),
                                                              'bg-slate-200 text-slate-800': !isBookingPast(b) && b.status === 'completed',
                                                              'bg-orange-100 text-orange-700': b.status === 'maintenance'
                                                          }">
                                                          @if(isBookingPast(b)) { FINALIZADO }
                                                          @else if(b.status === 'pending') { RESERVADO }
                                                          @else if(b.status === 'confirmed') { CONFIRMADO }
                                                          @else if(b.status === 'available') { DISPONIBLE }
                                                          @else if(b.status === 'cancelled') { CANCELADO }
                                                          @else if(b.status === 'completed') { COMPLETADO }
                                                          @else if(b.status === 'booked') { RESERVADO }
                                                          @else if(b.status === 'maintenance') { MANTENIMIENTO }
                                                          @else { {{ b.status }} }
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <!-- Scrollable Content -->
                                            <div class="flex-1 overflow-y-auto custom-scrollbar p-5">
                                                <div class="space-y-6">
                                                    
                                                    <!-- 1. Customer Info -->
                                                    <div class="space-y-3">
                                                        <h3 class="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Información del Cliente</h3>
                                                        <div class="flex items-start gap-3">
                                                             <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                                                {{ (b.customer_name || 'C').charAt(0) }}
                                                             </div>
                                                             <div class="space-y-1 w-full">
                                                                 <div>
                                                                     <p class="text-[9px] text-slate-700 font-bold uppercase">Nombre Completo</p>
                                                                     <p class="text-sm font-bold text-slate-800">{{ b.customer_name || 'Cliente' }}</p>
                                                                 </div>
                                                                 <div class="grid grid-cols-2 gap-2">
                                                                     <div>
                                                                         <p class="text-[9px] text-slate-700 font-bold uppercase">Documento</p>
                                                                         <p class="text-[10px] text-slate-700">{{ b.customer_doc_type || 'ID' }} {{ b.customer_doc_number || '---' }}</p>
                                                                     </div>
                                                                     <div>
                                                                         <p class="text-[9px] text-slate-700 font-bold uppercase">Nacionalidad</p>
                                                                         <p class="text-[10px] text-slate-700">{{ b.customer_nationality || '---' }}</p>
                                                                     </div>
                                                                 </div>
                                                                 <div>
                                                                     <p class="text-[9px] text-slate-700 font-bold uppercase">Contacto</p>
                                                                     <p class="text-[10px] text-slate-700 flex items-center gap-1 truncate">
                                                                        <svg class="w-3 h-3 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                                        {{ b.customer_email || 'Sin email' }}
                                                                     </p>
                                                                     <p class="text-[10px] text-slate-700 flex items-center gap-1 mt-0.5">
                                                                        <svg class="w-3 h-3 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                                        {{ b.customer_phone || 'Sin teléfono' }}
                                                                     </p>
                                                                 </div>
                                                             </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- 2. Reservation Details -->
                                                    <div class="space-y-3">
                                                        <h3 class="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Detalles de la Reserva</h3>
                                                        <div class="grid grid-cols-2 gap-3">
                                                            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                <p class="text-[9px] font-bold text-slate-700 uppercase">Vehículo</p>
                                                                <div class="flex items-center gap-2 mt-1">
                                                                    <div class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                                                                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                                                    </div>
                                                                    <div class="min-w-0">
                                                                        <p class="text-xs font-black text-slate-800 truncate">{{ b.plate || selectedInstance()?.plate || 'PENDIENTE' }}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                <p class="text-[9px] font-bold text-slate-700 uppercase">Seguro</p>
                                                                <p class="text-xs font-bold text-slate-800 capitalize mt-1 truncate">{{ b.insurance_type || 'Básico' }}</p>
                                                            </div>
                                                            <div class="col-span-2 border-t border-slate-100 pt-2 flex justify-between items-end">
                                                                <span class="text-[10px] font-bold text-slate-500">Total</span>
                                                                 @if(b.status === 'maintenance') {
                                                                     <span class="text-xl font-black text-slate-300">-</span>
                                                                 } @else {
                                                                     <span class="text-xl font-black text-emerald-600">\${{ b.total_price | number:'1.0-0' }}</span>
                                                                 }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- 3. Logistics -->
                                                    <div class="space-y-3">
                                                        <h3 class="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Logística</h3>
                                                        <div class="space-y-3">
                                                            <!-- Pickup -->
                                                            <div class="bg-green-50/50 p-3 rounded-xl border border-green-100 flex gap-3">
                                                                <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm shrink-0">
                                                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                                                </div>
                                                                <div class="min-w-0">
                                                                    <p class="text-[9px] font-black text-green-700 uppercase tracking-wider mb-1">Retiro</p>
                                                                    <p class="text-xs font-bold text-slate-800">{{ formatFullDate(b.start_date) }} <span class="text-slate-500 font-normal">| {{ b.pickup_time || '10:00' }}</span></p>
                                                                    <p class="text-[10px] text-slate-800 truncate">{{ b.pickup_location || 'Cartagena' }}</p>
                                                                </div>
                                                            </div>
                                                            <!-- Dropoff -->
                                                            <div class="bg-red-50/50 p-3 rounded-xl border border-red-100 flex gap-3">
                                                                <div class="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm shrink-0">
                                                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                                                </div>
                                                                <div class="min-w-0">
                                                                    <p class="text-[9px] font-black text-red-700 uppercase tracking-wider mb-1">Entrega</p>
                                                                    <p class="text-xs font-bold text-slate-800">{{ formatFullDate(b.end_date) }} <span class="text-slate-500 font-normal">| {{ b.dropoff_time || '10:00' }}</span></p>
                                                                    <p class="text-[10px] text-slate-800 truncate">{{ b.dropoff_location || 'Cartagena' }}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <!-- 4. Notes -->
                                                    @if(b.notes) {
                                                        <div class="space-y-3">
                                                            <h3 class="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Notas / Observaciones</h3>
                                                            <div class="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 flex gap-3">
                                                                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                                                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                </div>
                                                                <div class="w-full">
                                                                    <p class="text-xs font-medium text-slate-800 italic leading-relaxed whitespace-pre-wrap">{{ b.notes }}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            
                                            <!-- Footer -->
                                            <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0 text-right">
                                                <p class="text-[9px] text-slate-700">Creada el {{ formatFullDate(b.created_at || b.start_date) }}</p>
                                            </div>
                                        } @else {
                                             <!-- Empty State -->
                                             <div class="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
                                                <svg class="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <p class="text-sm font-black uppercase text-slate-300">Selecciona un evento</p>
                                                <p class="text-xs text-slate-300 mt-1">Haz clic en un evento del calendario</p>
                                             </div>
                                        }
                                    </div>

                                    <!-- Right Panel: Manage Status -->
                                    <div class="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-blue-600/5 h-full flex flex-col min-h-[500px] relative">
                                        <!-- Header -->
                                        <div class="mb-8 relative">
                                            <!-- Icon top right absolute -->
                                            <div class="absolute top-0 right-0 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400">
                                                 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>

                                            <div>
                                                <h3 class="text-3xl font-black text-slate-900 uppercase leading-none tracking-[0.08em]">GESTIONAR ESTADO</h3>
                                            </div>
                                        </div>

                                        <!-- Inputs Grid -->
                                        <div class="grid grid-cols-2 gap-4 mb-6">
                                             <!-- Desde -->
                                             <div class="relative">
                                                <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">DESDE</label>
                                                <div (click)="togglePicker('start', $event)" 
                                                     class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm cursor-pointer hover:border-blue-300 transition-all flex items-center select-none"
                                                     [class.ring-2]="pickerMode() === 'start'" [class.ring-blue-500]="pickerMode() === 'start'"
                                                     [class.text-slate-700]="!blockStart" [class.text-slate-900]="blockStart">
                                                     <span [class.text-slate-300]="!blockStart" [class.font-medium]="!blockStart">{{ blockStart ? (blockStart | date:'dd/MM/yyyy') : 'DD/MM/AAAA' }}</span>
                                                </div>
                                                <svg class="w-4 h-4 text-slate-700 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                
                                                @if (pickerMode() === 'start') {
                                                    <div class="fixed inset-0 z-40" (click)="closePicker()"></div>
                                                    <div class="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 p-4 w-72 animate-scale-in origin-top-left font-sans" (click)="$event.stopPropagation()">
                                                         <div class="flex justify-between items-center mb-4">
                                                             <button aria-label="Mes anterior" (click)="changePickerMonth(-1, $event)" class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
                                                             <span class="font-black text-sm text-slate-800 capitalize">{{ formatMonthYear(pickerViewDate()) }}</span>
                                                             <button aria-label="Mes siguiente" (click)="changePickerMonth(1, $event)" class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button>
                                                         </div>
                                                         <div class="grid grid-cols-7 mb-2">
                                                             @for(d of weekDays; track d) {
                                                                <div class="text-[10px] font-black text-slate-700 text-center uppercase">{{ d }}</div>
                                                             }
                                                         </div>
                                                         <div class="grid grid-cols-7 gap-1">
                                                             @for(d of pickerDays; track $index) {
                                                                 @if(d) {
                                                                    <button (click)="!isDateDisabled(d!) && selectPickerDate(d!, $event)" 
                                                                            class="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative"
                                                                            [class.bg-slate-900]="isDateSelected(d!)"
                                                                            [class.text-white]="isDateSelected(d!)"
                                                                            [class.text-slate-700]="!isDateSelected(d!) && !isDateDisabled(d!)"
                                                                            [class.hover:bg-slate-100]="!isDateSelected(d!) && !isDateDisabled(d!)"
                                                                            [class.hover:text-slate-900]="!isDateSelected(d!) && !isDateDisabled(d!)"
                                                                            [class.text-slate-200]="isDateDisabled(d!)"
                                                                            [class.cursor-not-allowed]="isDateDisabled(d!)">
                                                                        {{ d!.getDate() }}
                                                                        @if(isToday(d!)) { <span class="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></span> }
                                                                    </button>
                                                                 } @else {
                                                                     <div></div>
                                                                 }
                                                             }
                                                         </div>
                                                    </div>
                                                }
                                             </div>
                                             <!-- Hasta -->
                                             <div class="relative">
                                                <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">HASTA</label>
                                                <div (click)="togglePicker('end', $event)" 
                                                     class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm cursor-pointer hover:border-blue-300 transition-all flex items-center select-none"
                                                     [class.ring-2]="pickerMode() === 'end'" [class.ring-blue-500]="pickerMode() === 'end'"
                                                     [class.text-slate-700]="!blockEnd" [class.text-slate-900]="blockEnd">
                                                     <span [class.text-slate-300]="!blockEnd" [class.font-medium]="!blockEnd">{{ blockEnd ? (blockEnd | date:'dd/MM/yyyy') : 'DD/MM/AAAA' }}</span>
                                                </div>
                                                <svg class="w-4 h-4 text-slate-700 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>

                                                @if (pickerMode() === 'end') {
                                                    <div class="fixed inset-0 z-40" (click)="closePicker()"></div>
                                                    <div class="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 p-4 w-72 animate-scale-in origin-top-right font-sans" (click)="$event.stopPropagation()">
                                                         <div class="flex justify-between items-center mb-4">
                                                             <button aria-label="Mes anterior" (click)="changePickerMonth(-1, $event)" class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
                                                             <span class="font-black text-sm text-slate-800 capitalize">{{ formatMonthYear(pickerViewDate()) }}</span>
                                                             <button aria-label="Mes siguiente" (click)="changePickerMonth(1, $event)" class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button>
                                                         </div>
                                                         <div class="grid grid-cols-7 mb-2">
                                                             @for(d of weekDays; track d) {
                                                                <div class="text-[10px] font-black text-slate-700 text-center uppercase">{{ d }}</div>
                                                             }
                                                         </div>
                                                         <div class="grid grid-cols-7 gap-1">
                                                             @for(d of pickerDays; track $index) {
                                                                 @if(d) {
                                                                    <button (click)="!isDateDisabled(d!) && selectPickerDate(d!, $event)" 
                                                                            class="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative"
                                                                            [class.bg-slate-900]="isDateSelected(d!)"
                                                                            [class.text-white]="isDateSelected(d!)"
                                                                            [class.text-slate-700]="!isDateSelected(d!) && !isDateDisabled(d!)"
                                                                            [class.hover:bg-slate-100]="!isDateSelected(d!) && !isDateDisabled(d!)"
                                                                            [class.hover:text-slate-900]="!isDateSelected(d!) && !isDateDisabled(d!)"
                                                                            [class.text-slate-200]="isDateDisabled(d!)"
                                                                            [class.cursor-not-allowed]="isDateDisabled(d!)">
                                                                        {{ d!.getDate() }}
                                                                        @if(isToday(d!)) { <span class="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></span> }
                                                                    </button>
                                                                 } @else {
                                                                     <div></div>
                                                                 }
                                                             }
                                                         </div>
                                                    </div>
                                                }
                                             </div>
                                        </div>

                                        <!-- Status Select -->
                                        <div class="mb-6">
                                             <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2"><span class="text-slate-900/50 mr-1">◎</span> ACCIÓN / ESTADO</label>
                                              <div class="relative">
                                                  <button (click)="toggleStatusDropdown($event)" class="w-full text-left pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:border-blue-300 transition-all flex items-center justify-between">
                                                      <span class="flex items-center gap-2">
                                                          @if(overrideStatus === 'maintenance') { <span>🛠️ Mantenimiento</span> }
                                                          @else if(overrideStatus === 'booked') { <span>📅 Reserva Manual</span> }
                                                          @else if(overrideStatus === 'available') { <span>✅ Liberar / Disponible</span> }
                                                      </span>
                                                      <svg class="w-4 h-4 text-slate-700 transition-transform duration-200" [class.rotate-180]="statusDropdownOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                                  </button>
                                                  
                                                  @if(statusDropdownOpen()) {
                                                      <div class="fixed inset-0 z-40" (click)="statusDropdownOpen.set(false)"></div>
                                                      <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-scale-in origin-top">
                                                          <button (click)="selectStatus('maintenance', $event)" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors" [class.bg-blue-50]="overrideStatus === 'maintenance'" [class.text-blue-600]="overrideStatus === 'maintenance'">
                                                              <span>🛠️</span> Mantenimiento
                                                          </button>
                                                          <button (click)="selectStatus('booked', $event)" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors" [class.bg-blue-50]="overrideStatus === 'booked'" [class.text-blue-600]="overrideStatus === 'booked'">
                                                              <span>📅</span> Reserva Manual
                                                          </button>
                                                          <button (click)="selectStatus('available', $event)" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors" [class.bg-blue-50]="overrideStatus === 'available'" [class.text-blue-600]="overrideStatus === 'available'">
                                                              <span>✅</span> Liberar / Disponible
                                                          </button>
                                                      </div>
                                                  }
                                              </div>
                                        </div>

                                        <!-- Notes -->
                                        <div class="flex-1 mb-8">
                                             <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2"><span class="text-slate-900/50 mr-1">💬</span> NOTAS</label>
                                             <textarea [(ngModel)]="blockReason" class="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-800 resize-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" placeholder="Escribe el motivo del bloqueo o detalles relevantes..."></textarea>
                                        </div>

                                        <!-- Button -->
                                        <button (click)="submitOverride()" class="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                                            APLICAR CAMBIOS
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </button>
                                        <p class="text-[9px] text-center text-slate-700 font-medium mt-4">Esta acción actualizará el estado inmediatamente.</p>

                                    </div>
                                </div>
                            } @else {
                                <div class="h-full flex flex-col items-center justify-center text-slate-300">
                                    <svg class="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p class="text-sm font-medium">Selecciona una unidad para ver detalles</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }

        <!-- MODALES SECUNDARIOS -->

        <!-- Manual Booking Modal -->
        @if (showManualBookingModal()) {
            <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 class="text-lg font-black text-slate-800 uppercase">{{ editingBookingId ? 'Editar Reserva' : 'Reserva Manual' }}</h3>
                        <div class="flex items-center gap-3">
                            @if(editingBookingId) {
                                <button (click)="deleteBooking()" class="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-1.5 transition-all flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Eliminar Reserva
                                </button>
                            }
                            <button aria-label="Cerrar" (click)="closeManualBookingModal()" class="text-slate-700 hover:text-slate-800 transition-colors"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                    </div>
                    <div class="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div class="p-6 grid grid-cols-2 gap-4" [ngClass]="{'opacity-50 pointer-events-none': editingBookingId && (isDropoffPassed() || editingBookingStatus() === 'cancelled')}">
                            <!-- Customer Info -->
                            <div class="col-span-2"><h4 class="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Cliente</h4></div>
                        
                        <!-- Left Column: Name, Phone, Docs -->
                        <div class="col-span-2 md:col-span-1 space-y-3">
                             <div>
                                 <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre Completo *</label>
                                 <input type="text" [(ngModel)]="manualBookingForm.fullName" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-700">
                             </div>

                             <!-- DDI & Phone Row (30/70) -->
                             <div class="grid grid-cols-[30%_1fr] gap-2 items-end">
                                 <div class="relative">
                                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">DDI</label>
                                     <div (click)="!isMaintenanceBooking() && showManualDDI.set(!showManualDDI())" 
                                          class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-white flex justify-between items-center transition-colors"
                                          [ngClass]="{'cursor-pointer hover:border-blue-300': !isMaintenanceBooking(), 'bg-slate-50 text-slate-700 cursor-not-allowed': isMaintenanceBooking()}">
                                         <span>{{ manualBookingForm.ddi }}</span>
                                         @if(!isMaintenanceBooking()) {
                                             <svg class="w-3 h-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                         }
                                     </div>
                                      @if(showManualDDI()) {
                                         <div class="fixed inset-0 z-[90]" (click)="showManualDDI.set(false)"></div>
                                         <div class="absolute z-[100] mt-1 w-[280px] bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden animate-fade-in-up">
                                             <div class="p-2 border-b border-gray-50 bg-white sticky top-0 z-10">
                                                 <input type="text" placeholder="Buscar país..." 
                                                        (input)="filterDDI($any($event.target).value)" 
                                                        (click)="$event.stopPropagation()"
                                                        [value]="ddiSearch()"
                                                        class="w-full bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-200 font-bold text-slate-700">
                                             </div>
                                             <div class="max-h-48 overflow-y-auto custom-scrollbar">
                                                 @for(country of filteredDDI(); track country.code) {
                                                     <div (click)="selectManualDDI(country)" class="px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-between group">
                                                         <div class="flex items-center gap-2">
                                                             <span class="text-lg">{{ country.flag }}</span>
                                                             <span>{{ country.name }}</span>
                                                         </div>
                                                         <span class="text-blue-500 font-black text-[10px]">{{ country.dialCode }}</span>
                                                     </div>
                                                 }
                                                 @if(filteredDDI().length === 0) {
                                                     <div class="px-3 py-4 text-center text-xs text-slate-700 italic">No se encontraron resultados</div>
                                                 }
                                             </div>
                                         </div>
                                     }
                                 </div>

                                 <div>
                                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Celular *</label>
                                     <input type="text" [(ngModel)]="manualBookingForm.phone" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-700">
                                 </div>
                             </div>

                             <!-- Tipo & No. Documento Row (30/70) -->
                             <div class="grid grid-cols-[30%_1fr] gap-2 items-end">
                                 <div class="relative">
                                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo</label>
                                     <div (click)="!isMaintenanceBooking() && showManualDocType.set(!showManualDocType())" 
                                          class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-white flex justify-between items-center transition-colors"
                                          [ngClass]="{'cursor-pointer hover:border-blue-300': !isMaintenanceBooking(), 'bg-slate-50 text-slate-700 cursor-not-allowed': isMaintenanceBooking()}">
                                         <span>{{ manualBookingForm.docType }}</span>
                                         @if(!isMaintenanceBooking()) {
                                             <svg class="w-3 h-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                         }
                                     </div>
                                     @if(showManualDocType()) {
                                         <div class="fixed inset-0 z-[90]" (click)="showManualDocType.set(false)"></div>
                                         <div class="absolute z-[100] mt-1 w-full bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden animate-fade-in-up">
                                             <div (click)="selectManualDocType('CC')" class="px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">CC</div>
                                             <div (click)="selectManualDocType('CE')" class="px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">CE</div>
                                             <div (click)="selectManualDocType('PAS')" class="px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">PAS</div>
                                             <div (click)="selectManualDocType('ID EX')" class="px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">ID EX</div>
                                         </div>
                                     }
                                 </div>

                                 <div>
                                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">No. Documento</label>
                                     <input type="text" [(ngModel)]="manualBookingForm.docNumber" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-700">
                                 </div>
                             </div>
                        </div>

                        <!-- Right Column: Email, Nationality -->
                        <div class="col-span-2 md:col-span-1 space-y-3">
                             <div>
                                 <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email *</label>
                                 <input type="email" [(ngModel)]="manualBookingForm.email" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-700">
                             </div>

                             <div>
                                 <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nacionalidad</label>
                                 <input type="text" [(ngModel)]="manualBookingForm.nationality" placeholder="Colombia" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-700">
                             </div>

                             @if(manualBookingForm.createdAt) {
                                 <div>
                                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha de Creación</label>
                                     <div class="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg cursor-not-allowed">
                                         {{ manualBookingForm.createdAt | date:'dd/MM/yyyy HH:mm' }}
                                     </div>
                                 </div>
                             }

                              <!-- Notification Row -->
                              @if(!editingBookingId) {
                                  <div class="pt-1">
                                      <label class="block text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                          Notificar por correo
                                      </label>
                                      <div class="flex items-center gap-4">
                                          <label class="flex items-center gap-2 cursor-pointer group">
                                              <div class="relative w-4 h-4 rounded border-2 transition-all flex items-center justify-center"
                                                   [class.bg-blue-600]="manualBookingForm.notifyAdmin"
                                                   [class.border-blue-600]="manualBookingForm.notifyAdmin"
                                                   [class.border-slate-300]="!manualBookingForm.notifyAdmin"
                                                   [class.hover:border-blue-400]="!manualBookingForm.notifyAdmin">
                                                  @if(manualBookingForm.notifyAdmin) {
                                                      <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" /></svg>
                                                  }
                                                  <input type="checkbox" [(ngModel)]="manualBookingForm.notifyAdmin" class="absolute inset-0 opacity-0 cursor-pointer">
                                              </div>
                                              <span class="text-[10px] font-bold text-slate-800 uppercase group-hover:text-blue-600 transition-colors">Admin</span>
                                          </label>

                                          <label class="flex items-center gap-2 cursor-pointer group">
                                              <div class="relative w-4 h-4 rounded border-2 transition-all flex items-center justify-center"
                                                   [class.bg-blue-600]="manualBookingForm.notifyUser"
                                                   [class.border-blue-600]="manualBookingForm.notifyUser"
                                                   [class.border-slate-300]="!manualBookingForm.notifyUser"
                                                   [class.hover:border-blue-400]="!manualBookingForm.notifyUser">
                                                  @if(manualBookingForm.notifyUser) {
                                                      <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" /></svg>
                                                  }
                                                  <input type="checkbox" [(ngModel)]="manualBookingForm.notifyUser" class="absolute inset-0 opacity-0 cursor-pointer">
                                              </div>
                                              <span class="text-[10px] font-bold text-slate-800 uppercase group-hover:text-blue-600 transition-colors">Usuario</span>
                                          </label>
                                      </div>
                                  </div>
                              }
                        </div>

                         <!-- Reservation Info -->
                         <div class="col-span-2 mt-2"><h4 class="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Detalles Reserva</h4></div>

                         <!-- Pickup Details (LEFT) -->
                         <div class="col-span-1 rounded-xl p-3 border transition-all"
                              [ngClass]="{'bg-gradient-to-br from-blue-50 to-slate-50 border-blue-100': !isPickupPassed(), 'bg-slate-100 border-slate-200': isPickupPassed()}">
                             <div class="flex items-center gap-2 mb-3 border-b pb-2"
                                  [ngClass]="{'border-blue-100': !isPickupPassed(), 'border-slate-200': isPickupPassed()}">
                                 <span class="w-2 h-2 rounded-full"
                                       [ngClass]="{'bg-blue-500 animate-pulse': !isPickupPassed(), 'bg-green-500': isPickupPassed()}"></span>
                                 <h5 class="text-[10px] font-black uppercase tracking-widest"
                                     [ngClass]="{'text-blue-600': !isPickupPassed(), 'text-slate-500': isPickupPassed()}">Retiro</h5>
                                 @if (isPickupPassed()) {
                                     <span class="ml-auto text-[8px] font-black text-green-600 uppercase bg-green-100 px-1.5 py-0.5 rounded">Retirado</span>
                                 }
                             </div>
                             
                              <div class="space-y-3" [ngClass]="{'opacity-60 pointer-events-none': isPickupPassed() || isMaintenanceBooking()}">
                                  <div>
                                      <label class="block text-[9px] font-bold text-slate-700 uppercase mb-1">Ciudad</label>
                                      <div class="w-full px-3 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-slate-100 flex items-center gap-2">
                                          <svg class="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                          <span>{{ isMaintenanceBooking() ? 'TALLER/OFICINA' : 'Cartagena' }}</span>
                                          <span class="ml-auto text-[8px] text-slate-700 uppercase">{{ isMaintenanceBooking() ? 'MTTO' : 'Único' }}</span>
                                      </div>
                                  </div>
                                 <div class="relative" [class.z-50]="showBookingPickupDate()">
                                     <label class="block text-[9px] font-bold text-slate-700 uppercase mb-1">Fecha</label>
                                     <button type="button" (click)="showBookingPickupDate.set(!showBookingPickupDate()); showBookingPickupTime.set(false)"
                                             class="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left flex items-center justify-between text-slate-800 text-xs font-bold"
                                             [class.text-blue-600]="manualBookingForm.startDate" [class.font-bold]="manualBookingForm.startDate">
                                         <span>{{ formatDisplayDate(manualBookingForm.startDate) }}</span>
                                         <svg class="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                     </button>
                                     @if (showBookingPickupDate()) {
                                         <div class="fixed inset-0 z-[90]" (click)="showBookingPickupDate.set(false)"></div>
                                         <div class="absolute inset-x-0 z-[100] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in mt-1 bottom-full mb-1">
                                             <app-calendar (dateSelected)="onBookingPickupDateSelected($event)"></app-calendar>
                                         </div>
                                     }
                                 </div>
                                 <div class="relative" [class.z-40]="showBookingPickupTime()">
                                     <label class="block text-[9px] font-bold text-slate-700 uppercase mb-1">Hora</label>
                                     <button type="button" (click)="showBookingPickupTime.set(!showBookingPickupTime()); showBookingPickupDate.set(false)"
                                             class="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left flex items-center justify-between text-slate-800 text-xs font-bold"
                                             [class.text-blue-600]="manualBookingForm.pickupTime" [class.font-bold]="manualBookingForm.pickupTime">
                                         <span>{{ formatDisplayTime(manualBookingForm.pickupTime) }}</span>
                                         <svg class="w-4 h-4 text-slate-700 transition-transform" [class.rotate-180]="showBookingPickupTime()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                     </button>
                                     @if (showBookingPickupTime()) {
                                         <div class="fixed inset-0 z-[90]" (click)="showBookingPickupTime.set(false)"></div>
                                         <div class="absolute inset-x-0 z-[100] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 py-2 max-h-48 overflow-y-auto animate-scale-in custom-scrollbar bottom-full mb-1">
                                             @for (time of timeOptions; track time) {
                                                 <button type="button" (click)="selectBookingTime('pickup', time)"
                                                         class="w-full px-4 py-2 text-left text-xs font-medium transition-all hover:bg-blue-50 hover:text-blue-700 border-l-2 border-transparent hover:border-blue-500"
                                                         [class.bg-blue-50]="manualBookingForm.pickupTime === time"
                                                         [class.text-blue-700]="manualBookingForm.pickupTime === time"
                                                         [class.border-blue-500]="manualBookingForm.pickupTime === time"
                                                         [class.font-bold]="manualBookingForm.pickupTime === time">
                                                     {{ formatDisplayTime(time) }}
                                                 </button>
                                             }
                                         </div>
                                     }
                                 </div>
                             </div>
                         </div>

                         <!-- Dropoff Details (RIGHT) -->
                         <div class="col-span-1 bg-gradient-to-br from-slate-50/80 to-slate-100/30 rounded-xl p-3 border border-slate-200/50">
                             <div class="flex items-center gap-2 mb-3 border-b border-slate-200/50 pb-2">
                                 <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                                 <h5 class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Devolución</h5>
                             </div>
                             
                             <div class="space-y-3">
                                 <div>
                                     <label class="block text-[9px] font-bold text-slate-700 uppercase mb-1">Ciudad</label>
                                     <div class="relative">
                                         <div (click)="showManualDropoffCity.set(!showManualDropoffCity())" class="w-full px-3 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-white cursor-pointer flex items-center gap-2 hover:border-slate-400 transition-colors">
                                             <svg class="w-3.5 h-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                              <span class="flex-1">{{ isMaintenanceBooking() ? 'TALLER/OFICINA' : manualBookingForm.dropoffLocation }}</span>
                                              @if(!isMaintenanceBooking()) {
                                                  <svg class="w-3 h-3 text-slate-700 transition-transform" [class.rotate-180]="showManualDropoffCity()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                              }
                                          </div>
                                           @if(showManualDropoffCity() && !isMaintenanceBooking()) {
                                             <div class="fixed inset-0 z-[90]" (click)="showManualDropoffCity.set(false)"></div>
                                             <div class="absolute z-[100] mt-1 w-full bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden animate-fade-in-up">
                                                 <div (click)="selectManualDropoffCity('Cartagena')" class="px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center gap-2" [class.bg-blue-50]="manualBookingForm.dropoffLocation === 'Cartagena'" [class.text-blue-600]="manualBookingForm.dropoffLocation === 'Cartagena'">
                                                     <span class="w-1.5 h-1.5 rounded-full" [class.bg-blue-500]="manualBookingForm.dropoffLocation === 'Cartagena'" [class.bg-slate-300]="manualBookingForm.dropoffLocation !== 'Cartagena'"></span>
                                                     Cartagena
                                                 </div>
                                                 <div (click)="selectManualDropoffCity('Barranquilla')" class="px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center gap-2" [class.bg-blue-50]="manualBookingForm.dropoffLocation === 'Barranquilla'" [class.text-blue-600]="manualBookingForm.dropoffLocation === 'Barranquilla'">
                                                     <span class="w-1.5 h-1.5 rounded-full" [class.bg-blue-500]="manualBookingForm.dropoffLocation === 'Barranquilla'" [class.bg-slate-300]="manualBookingForm.dropoffLocation !== 'Barranquilla'"></span>
                                                     Barranquilla
                                                 </div>
                                                 <div (click)="selectManualDropoffCity('Santa Marta')" class="px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center gap-2" [class.bg-blue-50]="manualBookingForm.dropoffLocation === 'Santa Marta'" [class.text-blue-600]="manualBookingForm.dropoffLocation === 'Santa Marta'">
                                                     <span class="w-1.5 h-1.5 rounded-full" [class.bg-blue-500]="manualBookingForm.dropoffLocation === 'Santa Marta'" [class.bg-slate-300]="manualBookingForm.dropoffLocation !== 'Santa Marta'"></span>
                                                     Santa Marta
                                                 </div>
                                             </div>
                                         }
                                     </div>
                                 </div>
                                 <div class="relative" [class.z-50]="showBookingDropoffDate()">
                                     <label class="block text-[9px] font-bold text-slate-700 uppercase mb-1">Fecha</label>
                                     <button type="button" (click)="showBookingDropoffDate.set(!showBookingDropoffDate()); showBookingDropoffTime.set(false)"
                                             class="w-full px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl transition-all text-left flex items-center justify-between text-slate-800 text-xs font-bold"
                                             [class.text-slate-700]="manualBookingForm.endDate" [class.font-bold]="manualBookingForm.endDate">
                                         <span>{{ formatDisplayDate(manualBookingForm.endDate) }}</span>
                                         <svg class="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                     </button>
                                     @if (showBookingDropoffDate()) {
                                         <div class="fixed inset-0 z-[90]" (click)="showBookingDropoffDate.set(false)"></div>
                                         <div class="absolute inset-x-0 z-[100] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in bottom-full mb-1">
                                             <app-calendar [minDate]="getBookingPickupDate()" (dateSelected)="onBookingDropoffDateSelected($event)"></app-calendar>
                                         </div>
                                     }
                                 </div>
                                 <div class="relative" [class.z-40]="showBookingDropoffTime()">
                                     <label class="block text-[9px] font-bold text-slate-700 uppercase mb-1">Hora</label>
                                     <button type="button" (click)="showBookingDropoffTime.set(!showBookingDropoffTime()); showBookingDropoffDate.set(false)"
                                             class="w-full px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl transition-all text-left flex items-center justify-between text-slate-800 text-xs font-bold"
                                             [class.text-slate-700]="manualBookingForm.dropoffTime" [class.font-bold]="manualBookingForm.dropoffTime">
                                         <span>{{ formatDisplayTime(manualBookingForm.dropoffTime) }}</span>
                                         <svg class="w-4 h-4 text-slate-700 transition-transform" [class.rotate-180]="showBookingDropoffTime()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                     </button>
                                     @if (showBookingDropoffTime()) {
                                         <div class="fixed inset-0 z-[90]" (click)="showBookingDropoffTime.set(false)"></div>
                                         <div class="absolute inset-x-0 z-[100] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 py-2 max-h-48 overflow-y-auto animate-scale-in custom-scrollbar bottom-full mb-1">
                                             @for (time of timeOptions; track time) {
                                                 <button type="button" (click)="selectBookingTime('dropoff', time)"
                                                         class="w-full px-4 py-2 text-left text-xs font-medium transition-all hover:bg-slate-50 hover:text-slate-800 border-l-2 border-transparent hover:border-slate-500"
                                                         [class.bg-slate-100]="manualBookingForm.dropoffTime === time"
                                                         [class.text-slate-800]="manualBookingForm.dropoffTime === time"
                                                         [class.border-slate-500]="manualBookingForm.dropoffTime === time"
                                                         [class.font-bold]="manualBookingForm.dropoffTime === time">
                                                     {{ formatDisplayTime(time) }}
                                                 </button>
                                             }
                                         </div>
                                     }
                                 </div>
                             </div>
                         </div>
                         
                         <div class="col-span-2 border-t border-slate-100 mt-2 pt-4">
                             <div class="flex flex-col md:flex-row gap-4">
                                 <!-- Left Column: Controls -->
                                 <div class="flex-1 space-y-4">
                                      <!-- Base Controls -->
                                       <div class="grid grid-cols-2 gap-3" [class.opacity-50]="isMaintenanceBooking()">
                                           <div>
                                               <label class="block text-[8px] font-bold text-slate-700 uppercase mb-0.5">Base Día</label>
                                               <input type="number" [ngModel]="isMaintenanceBooking() ? null : manualBookingForm.pricePerDay" (ngModelChange)="manualBookingForm.pricePerDay = $event; calculateManualPrice('price')" [disabled]="isMaintenanceBooking()" class="w-full px-2 py-2 text-xs font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-300 disabled:bg-slate-50">
                                           </div>
                                           <div>
                                               <label class="block text-[8px] font-bold text-slate-700 uppercase mb-0.5">Lavado</label>
                                               <input type="number" [ngModel]="isMaintenanceBooking() ? null : manualBookingForm.washFee" (ngModelChange)="manualBookingForm.washFee = $event; calculateManualPrice('other')" [disabled]="isMaintenanceBooking()" class="w-full px-2 py-2 text-xs font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-300 disabled:bg-slate-50">
                                           </div>
                                       </div>

                                      <!-- Additional Costs Manager -->
                                      <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                          <h5 class="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-2">Costos Adicionales</h5>
                                          
                                          <!-- List -->
                                          <div class="space-y-2 mb-3">
                                              @for(cost of manualBookingForm.additionalCosts; track $index) {
                                                  <div class="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                      <span class="text-[10px] font-bold text-slate-800 flex-1 truncate">{{ cost.name }}</span>
                                                      <div class="flex items-center gap-1">
                                                           <span class="text-[10px] text-slate-700">$</span>
                                                           <input type="number" 
                                                                  [ngModel]="cost.price" 
                                                                  (ngModelChange)="cost.price = $event; calculateManualPrice('other')" 
                                                                  [disabled]="isMaintenanceBooking()"
                                                                  class="w-20 px-1.5 py-0.5 text-[10px] font-black text-slate-800 bg-slate-50 border border-transparent hover:border-blue-200 focus:border-blue-400 rounded outline-none text-right transition-all">
                                                       </div>
                                                      <button aria-label="Eliminar costo" (click)="removeAdditionalCost($index)" class="text-red-400 hover:text-red-600 ml-1">
                                                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                      </button>
                                                  </div>
                                              }
                                              @if(manualBookingForm.additionalCosts.length === 0) {
                                                  <p class="text-[9px] text-slate-300 italic text-center py-1">Sin costos adicionales</p>
                                              }
                                          </div>

                                          <!-- Add New -->
                                           <div class="flex items-center gap-2">
                                               <input type="text" [(ngModel)]="newCostName" [disabled]="isMaintenanceBooking()" placeholder="Nombre (ej. Domicilio)" class="flex-[2] px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-300 disabled:bg-slate-50 disabled:text-slate-700">
                                               <input type="number" [(ngModel)]="newCostPrice" [disabled]="isMaintenanceBooking()" placeholder="Valor" class="flex-1 px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-300 disabled:bg-slate-50 disabled:text-slate-700">
                                               <button aria-label="Agregar costo" (click)="addAdditionalCost()" [disabled]="!newCostName || newCostPrice === null || isMaintenanceBooking()" class="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                                   <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                               </button>
                                           </div>
                                      </div>
                                 </div>

                                 </div>
                             </div>
                             
                             <!-- Clean Integrated Summary Section -->
                             <div class="mt-4 pt-4 border-t border-slate-100 col-span-2">
                                 <div class="flex items-center justify-between mb-3">
                                     <h5 class="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                         Resumen de Cuenta
                                         <button (click)="calculateManualPrice('price')" class="p-1 rounded-lg hover:bg-slate-100 text-blue-500 transition-colors" title="Recalcular">
                                             <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                         </button>
                                     </h5>
                                 </div>
                                 
                                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div class="space-y-1.5" [class.opacity-50]="isMaintenanceBooking()">
                                         <div class="flex justify-between text-xs text-slate-500 font-medium">
                                             <span>Días ({{ breakdownData.days }})</span>
                                             <span class="text-slate-700 font-bold ml-auto">{{ isMaintenanceBooking() ? '---' : ((breakdownData.baseTotal || 0) | currency:'COP':'symbol':'1.0-0') }}</span>
                                          </div>
                                          <div class="flex justify-between text-xs text-slate-500 font-medium">
                                              <span>Lavado</span>
                                              <div class="flex items-center ml-auto">
                                                  <span class="text-slate-700 mr-1">$</span>
                                                  <input type="number" [ngModel]="isMaintenanceBooking() ? null : manualBookingForm.washFee" (ngModelChange)="manualBookingForm.washFee = $event; calculateManualPrice('other')" [disabled]="isMaintenanceBooking()" class="w-20 text-right text-xs font-bold text-slate-700 border-b border-slate-200 hover:border-blue-400 focus:border-blue-600 outline-none bg-transparent py-0.5 transition-colors disabled:border-transparent">
                                              </div>
                                          </div>
                                          @if(breakdownData.dropoff > 0) {
                                              <div class="flex justify-between text-xs text-slate-500 font-medium animate-fade-in">
                                                  <span>Recargo Ciudad</span>
                                                  <span class="text-slate-700 font-bold ml-auto">{{ isMaintenanceBooking() ? '---' : (breakdownData.dropoff | currency:'COP':'symbol':'1.0-0') }}</span>
                                              </div>
                                          }
                                         @for(cost of manualBookingForm.additionalCosts; track $index) {
                                             <div class="flex justify-between text-xs text-emerald-600 font-medium animate-fade-in">
                                                 <span>+ {{ cost.name }}</span>
                                                 <span class="font-bold ml-auto">{{ cost.price | currency:'COP':'symbol':'1.0-0' }}</span>
                                             </div>
                                         }
                                     </div>
                                     
                                     <div class="flex flex-col items-end justify-center" [class.opacity-50]="isMaintenanceBooking()">
                                         <p class="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Total a Pagar</p>
                                         <p class="text-3xl font-black text-slate-900 tracking-tighter leading-none">{{ isMaintenanceBooking() ? '---' : (manualBookingForm.totalPrice | currency:'COP':'symbol':'1.0-0') }}</p>
                                     </div>
                                 </div>
                             </div>
                         
                         <div class="col-span-2">
                             <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notas Internas</label>
                             <div class="relative group">
                                 @if(manualBookingForm.notes.startsWith('Mantenimiento / Ajuste de estado:')) {
                                     <div class="px-3 py-1.5 bg-indigo-50 border-x border-t border-slate-200 rounded-t-lg text-[10px] font-black text-indigo-600 uppercase tracking-tight select-none border-b border-dashed">
                                         Mantenimiento / Ajuste de estado
                                     </div>
                                     <textarea 
                                         [ngModel]="manualBookingForm.notes.replace('Mantenimiento / Ajuste de estado:', '').trim()"
                                         (ngModelChange)="manualBookingForm.notes = 'Mantenimiento / Ajuste de estado: ' + $event"
                                         rows="2" 
                                         class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-b-lg focus:ring-2 focus:ring-blue-500/20 outline-none resize-none border-t-0"
                                     ></textarea>
                                 } @else {
                                     <textarea 
                                         [(ngModel)]="manualBookingForm.notes" 
                                         rows="2" 
                                         class="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                                     ></textarea>
                                 }
                             </div>
                         </div>
                    </div>
                    </div>
                    <div class="p-4 bg-slate-50 flex gap-3">
                        <button (click)="closeManualBookingModal()" class="flex-1 py-3 text-xs font-bold text-slate-500 border rounded-xl">Cancelar</button>
                        


                        <button (click)="editingBookingId ? saveEditedBooking() : saveManualBooking()" 
                                class="flex-1 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed" 
                                [disabled]="manualBookingLoading() || (editingBookingId && (isDropoffPassed() || editingBookingStatus() === 'cancelled'))">
                            {{ editingBookingId ? (isDropoffPassed() ? 'Completado' : (editingBookingStatus() === 'cancelled' ? 'Cancelado' : 'Actualizar')) : 'Guardar' }}
                        </button>
                    </div>
                </div>
            </div>
        }

        <!-- Create Instance Modal -->
        @if (showCreateInstanceModal()) {
            <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in">
                    <h3 class="text-lg font-black text-slate-800 uppercase mb-4">Nueva Unidad ({{ selectedVehicle()?.name }})</h3>
                    <div class="space-y-4">
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Placa (AAA-123)</label><input type="text" [ngModel]="newInstanceForm.plate" (ngModelChange)="formatNewPlate($event)" maxlength="7" class="w-full px-4 py-3 text-lg font-mono font-bold text-center border-2 border-slate-200 rounded-xl uppercase"></div>
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Costo Lavada</label><input type="number" [(ngModel)]="newInstanceForm.wash_price" class="w-full px-3 py-2 text-xs border rounded-lg"></div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button (click)="showCreateInstanceModal.set(false)" class="flex-1 py-3 text-xs font-bold text-slate-500 border rounded-xl">Cancelar</button>
                        <button (click)="saveNewInstance()" class="flex-1 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl">Crear</button>
                    </div>
                </div>
            </div>
        }


        <!-- Edit Rates Modal -->
        @if (showEditRatesModal()) {
            <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" (click)="showEditRatesModal.set(false)">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in" (click)="$event.stopPropagation()">
                    <!-- Header -->
                    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 class="text-lg font-black text-slate-800 uppercase tracking-tight">Costo Lavada</h3>
                        <button aria-label="Cerrar" (click)="showEditRatesModal.set(false)" class="text-slate-700 hover:text-slate-800 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <!-- Body -->
                    <div class="p-5 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        
                        <!-- Header Vehículo -->
                        <div class="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                             <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             </div>
                             <div>
                                 <p class="text-[10px] font-bold text-slate-500 uppercase">Vehículo</p>
                                 <p class="text-sm font-black text-slate-800">{{ editRatesData.instanceIndentifier }}</p>
                             </div>
                        </div>


                        <!-- 1. COSTOS INDIVIDUALES -->
                        <div>
                             <h4 class="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Costos Individuales</h4>
                             <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Costo Lavado</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-bold">$</span>
                                        <input type="number" [(ngModel)]="editRatesData.currentWashPrice" class="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                    </div>
                                    <p class="text-[9px] text-slate-700 mt-1">Costo específico para esta unidad.</p>
                                </div>
                                <!-- Removed Costo Diario (Ajuste) -->
                             </div>
                        </div>

                    </div>



                    <!-- Footer -->
                    <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button (click)="showEditRatesModal.set(false)" class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wide transition-colors">Cancelar</button>
                        <button (click)="saveRates()" class="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 uppercase tracking-wide transition-all transform active:scale-95">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        }
    </div>
    `,
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }

        /* =========================================================
           MOBILE PORTRAIT (Vertical) — max-width: 767px + portrait
           ========================================================= */
        @media (max-width: 767px) and (orientation: portrait) {
            /* Full-width content, comfortable padding */
            .inventory-categories-grid {
                grid-template-columns: 1fr !important;
            }
            /* Modals: full width with minimal horizontal margins */
            .inventory-modal-panel {
                max-width: calc(100vw - 2rem) !important;
                margin: 0 auto !important;
                border-radius: 1rem !important;
            }
            /* Booking/edit modals full height */
            .inventory-booking-modal {
                width: calc(100vw - 1rem) !important;
                max-height: 90vh !important;
            }
        }

        /* =========================================================
           MOBILE LANDSCAPE (Horizontal) — max-width: 900px + landscape
           ========================================================= */
        @media (max-width: 900px) and (orientation: landscape) {
            /* 2-column category grid for landscape mobile */
            .inventory-categories-grid {
                grid-template-columns: 1fr 1fr !important;
            }
            /* Modals: constrained height to fit screen */
            .inventory-modal-panel {
                max-height: 90vh !important;
                overflow-y: auto !important;
            }
            /* Booking/edit modals: wider column layout */
            .inventory-booking-modal {
                width: min(95vw, 480px) !important;
                max-height: 88vh !important;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminInventoryComponent {
    private apiService = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);

    vehicles = signal<any[]>([]);
    selectedVehicle = signal<any>(null);
    instances = signal<any[]>([]);
    instancesLoading = signal<boolean>(false);
    selectedInstance = signal<any>(null);
    instanceBookings = signal<any[]>([]);
    instanceBookingsLoading = signal<boolean>(false);

    currentDate = signal(new Date());
    pickerViewDate = signal(new Date()); // Added for date display

    // UI State
    // Filter State
    showCalendarFilters = signal(false);
    showPickups = signal(true);
    showDropoffs = signal(true);
    showMaintenance = signal(true);

    viewMode = signal<'month' | 'quarter' | 'semester'>('month');

    showManualBookingModal = signal(false);
    showCreateInstanceModal = signal(false);
    showCreateCategoryModal = signal(false);
    manualBookingLoading = signal(false);
    categoryLoading = signal(false);

    // Form data
    // Date Ranges for Special Seasons
    specialPeriods = signal<{ name: string, start: string, end: string, price: number }[]>([]);

    newCategoryForm: any = {
        name: '',
        description: '',
        base_price: 0,
        image_url: '',
        passengers: 5,
        luggage: 2,
        transmission: 'Automática',
        status: 'active',
        special_periods: []
    };

    // Helper methods for ranges
    addSpecialPeriod() {
        this.specialPeriods.update(p => [...p, { name: '', start: '', end: '', price: 0 }]);
    }
    removeSpecialPeriod(index: number) {
        this.specialPeriods.update(p => p.filter((_, i) => i !== index));
    }


    manualBookingForm = {
        fullName: '',
        email: '',
        phone: '',
        ddi: '+57',
        nationality: 'Colombia',
        docType: 'CC',
        docNumber: '',
        startDate: '',
        endDate: '',
        pickupTime: '10:00',
        dropoffTime: '10:00',
        pickupLocation: 'Cartagena',
        dropoffLocation: 'Cartagena',
        totalPrice: 0,
        notes: '',
        pricePerDay: 0,
        washFee: 0,
        additionalCosts: [] as { name: string, price: number }[],
        createdAt: null as string | null,
        notifyAdmin: false,
        notifyUser: false
    };
    newCostName = '';
    newCostPrice: number | null = null;
    newInstanceForm = { plate: '', wash_price: 35000, status: 'active' };
    blockStart = '';
    blockEnd = '';
    blockReason = '';
    overrideStatus = 'maintenance';
    wasPickupPassed = false;

    // Manual Booking Dropdown States
    showManualDDI = signal(false);
    showManualDocType = signal(false);
    selectedCategoryFile: File | null = null;
    showManualPickupCity = signal(false);
    showManualDropoffCity = signal(false);

    // Booking Date/Time Picker States
    showBookingPickupDate = signal(false);
    showBookingPickupTime = signal(false);
    showBookingDropoffDate = signal(false);
    showBookingDropoffTime = signal(false);
    bookingPickupCalendarMonth = signal(new Date());
    bookingDropoffCalendarMonth = signal(new Date());

    // Time options for picker
    timeOptions = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
        .flatMap(h => [h, h.replace(':00', ':30')]); // Simple 30m slots

    customCategoryType = '';

    selectedCalendarEvent = signal<any>(null);
    categoryMenuOpen = signal(false);
    isEditingCategory = signal(false);
    transmissionDropdownOpen = signal(false);
    breakdownData: any = { days: 0, baseTotal: 0, wash: 0, dropoff: 0 };
    activeSeasonNames = signal<string[]>([]);

    constructor() {
        this.apiService.adminSetupSchema().subscribe({
            next: (res) => console.log('Schema check:', res),
            error: (err) => console.error('Schema check error:', err),
            complete: () => this.loadVehicles()
        });
    }

    loadVehicles() {
        this.apiService.adminGetVehicles().subscribe({
            next: (data) => {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

                const mapped = data.map(v => {
                    let currentPrice = Number(v.base_price || v.price_per_day || 0);
                    let isSpecial = false;
                    let seasonName = '';

                    // Check for special periods
                    let periods = [];
                    if (typeof v.special_periods === 'string') {
                        try { periods = JSON.parse(v.special_periods); } catch (e) { }
                    } else if (Array.isArray(v.special_periods)) {
                        periods = v.special_periods;
                    }

                    if (periods && periods.length > 0) {
                        for (const p of periods) {
                            if (p.start && p.end && todayStr >= p.start && todayStr <= p.end) {
                                currentPrice = Number(p.price);
                                isSpecial = true;
                                seasonName = p.name || '';
                                break; // Take the first matching period
                            }
                        }
                    }

                    return {
                        ...v,
                        stock: v.stock || 0,
                        is_active: v.status === 'active',
                        total_bookings_count: v.total_bookings_count || 0,
                        current_price: currentPrice,
                        is_special_price: isSpecial,
                        season_name: seasonName
                    };
                });
                this.vehicles.set(mapped);

                // Fetch actual instance count and calculations
                data.forEach(v => {
                    this.apiService.adminGetInstances(v.id).subscribe(ins => {
                        const availableCount = ins.filter(i => i.current_status === 'available').length;
                        const bookedCount = ins.filter(i => i.current_status === 'booked').length;
                        const maintenanceCount = ins.filter(i => i.current_status === 'maintenance').length;
                        const totalInstances = ins.length;

                        // Determine category status:
                        // - If all instances are booked -> 'booked'
                        // - If all instances are in maintenance -> 'maintenance'
                        // - Otherwise -> 'available'
                        let categoryStatus = 'available';
                        if (totalInstances > 0) {
                            if (bookedCount === totalInstances) {
                                categoryStatus = 'booked';
                            } else if (maintenanceCount === totalInstances) {
                                categoryStatus = 'maintenance';
                            } else if (availableCount === 0 && (bookedCount + maintenanceCount) === totalInstances) {
                                // Mixed: all are either booked or maintenance, none available
                                categoryStatus = bookedCount >= maintenanceCount ? 'booked' : 'maintenance';
                            }
                        }

                        this.vehicles.update(list => list.map(item =>
                            item.id === v.id ? {
                                ...item,
                                stock: totalInstances,
                                available_count: availableCount,
                                active_bookings_count: bookedCount,
                                maintenance_count: maintenanceCount,
                                category_status: categoryStatus,
                                // Sum up month bookings from all instances
                                month_bookings_count: ins.reduce((acc, curr) => acc + (Number(curr.month_bookings_count) || 0), 0)
                            } : item
                        ));
                    });
                });
                this.cdr.markForCheck();
            }
        });
    }

    openCategoryDetail(vehicle: any) {
        this.selectedVehicle.set(vehicle);
        this.loadInstances(vehicle.id);
        this.selectedInstance.set(null);
    }

    openCreateCategoryModal() {
        this.newCategoryForm = {
            name: '',
            description: '',
            base_price: 0,
            image_url: '',
            passengers: 5,
            luggage: 2,
            transmission: 'Automático',
            status: 'active',
            special_periods: null
        };
        this.customCategoryType = '';
        this.isEditingCategory.set(false);
        this.selectedCategoryFile = null;
        this.specialPeriods.set([]);
        this.showCreateCategoryModal.set(true);
    }

    editCategory() {
        const vehicle = this.selectedVehicle();
        if (!vehicle) return;

        this.isEditingCategory.set(true);
        const rawTransmission = (vehicle.transmission || 'Automático').toLowerCase();
        const normalizedTransmission = rawTransmission.includes('auto') ? 'Automático' : 'Manual';

        this.newCategoryForm = {
            name: vehicle.name,
            description: vehicle.description || '',
            base_price: vehicle.base_price || vehicle.price_per_day || 0,
            image_url: vehicle.image_url || '',
            passengers: vehicle.passengers || 5,
            luggage: vehicle.luggage || 2,
            transmission: normalizedTransmission,
            status: vehicle.status || 'active',
            special_periods: vehicle.special_periods || null
        };

        // Parse special periods
        let periods = [];
        if (typeof vehicle.special_periods === 'string') {
            try { periods = JSON.parse(vehicle.special_periods); } catch (e) { }
        } else if (vehicle.special_periods && Array.isArray(vehicle.special_periods)) {
            periods = vehicle.special_periods;
        }

        this.specialPeriods.set(periods || []);
        this.customCategoryType = '';
        this.selectedCategoryFile = null;
        this.categoryMenuOpen.set(false);
        this.showCreateCategoryModal.set(true);
    }

    // Calendar Logic for Special Periods
    activeCalendar = signal<string | null>(null);

    toggleCalendar(index: number, type: 'start' | 'end', event: Event) {
        event.stopPropagation();
        event.preventDefault();
        const key = String(index) + '-' + type;
        const current = this.activeCalendar();
        if (current === key) {
            this.activeCalendar.set(null);
        } else {
            this.activeCalendar.set(key);
        }
    }

    isCalendarOpen(index: number, type: 'start' | 'end'): boolean {
        return this.activeCalendar() === (String(index) + '-' + type);
    }

    // Close calendar on document click (implement in template if needed, or simple toggle)

    getPeriodDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        // Parse "YYYY-MM-DD" as local date
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
        return null;
    }
    setPeriodDate(index: number, type: 'start' | 'end', date: Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        // Update signal immutably
        const updated = [...this.specialPeriods()];
        updated[index] = { ...updated[index], [type]: dateStr };

        // Logic: End date cannot be before start date
        if (type === 'start') {
            if (updated[index].end && dateStr > updated[index].end) {
                updated[index].end = dateStr; // Set end to start if it was earlier
            }
        }

        this.specialPeriods.set(updated);

        // Small delay to prevent click interference
        setTimeout(() => {
            this.activeCalendar.set(null);
        }, 100);
    }

    getMinStartDate(index: number): Date | null {
        // Allow selection from January 1st of current year
        const jan1 = new Date(new Date().getFullYear(), 0, 1);
        jan1.setHours(0, 0, 0, 0);
        return jan1;
    }

    getUnavailableRanges(currentIndex: number): { start: Date, end: Date }[] {
        const periods = this.specialPeriods();
        const ranges: { start: Date, end: Date }[] = [];

        periods.forEach((p, i) => {
            if (i !== currentIndex && p.start && p.end) {
                const start = this.getPeriodDate(p.start);
                const end = this.getPeriodDate(p.end);
                if (start && end) {
                    ranges.push({ start, end });
                }
            }
        });
        return ranges;
    }

    // Booking Calendar Helpers
    getBookingCalendarDays(monthSignal: typeof this.bookingPickupCalendarMonth) {
        const current = monthSignal();
        const year = current.getFullYear();
        const month = current.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days: { day: number, date: Date, disabled: boolean, selected: boolean, empty: boolean }[] = [];

        for (let i = 0; i < startingDay; i++) {
            days.push({ day: 0, date: new Date(), disabled: true, selected: false, empty: true });
        }

        for (let i = 1; i < daysInMonth; i++) {
            const date = new Date(year, month, i);
            date.setHours(0, 0, 0, 0);
            days.push({
                day: i,
                date: date,
                disabled: date < today,
                selected: false,
                empty: false
            });
        }
        return days;
    }

    selectBookingDate(type: 'pickup' | 'dropoff', date: Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        if (type === 'pickup') {
            this.manualBookingForm.startDate = dateStr;
            this.showBookingPickupDate.set(false);
        } else {
            this.manualBookingForm.endDate = dateStr;
            this.showBookingDropoffDate.set(false);
        }
        this.calculateManualPrice();
    }

    // Handler for app-calendar dateSelected event (pickup)
    onBookingPickupDateSelected(date: Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        this.manualBookingForm.startDate = `${y}-${m}-${d}`;
        this.showBookingPickupDate.set(false);
        this.calculateManualPrice();
    }

    // Handler for app-calendar dateSelected event (dropoff)
    onBookingDropoffDateSelected(date: Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        this.manualBookingForm.endDate = `${y}-${m}-${d}`;
        this.showBookingDropoffDate.set(false);
        this.calculateManualPrice();
    }

    selectBookingTime(type: 'pickup' | 'dropoff', time: string) {
        if (type === 'pickup') {
            this.manualBookingForm.pickupTime = time;
            this.showBookingPickupTime.set(false);
        } else {
            this.manualBookingForm.dropoffTime = time;
            this.showBookingDropoffTime.set(false);
        }
        this.calculateManualPrice();
    }

    formatDisplayDate(dateStr: string): string {
        if (!dateStr) return 'Seleccionar';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    // Get pickup date as Date object for minDate binding
    getBookingPickupDate(): Date | null {
        if (!this.manualBookingForm.startDate) return null;
        return new Date(this.manualBookingForm.startDate);
    }

    // Check if pickup date/time has already passed (car already picked up)
    isPickupPassed(): boolean {
        if (!this.editingBookingId) return false;
        // Use the initial state calculated when form was populated
        return this.wasPickupPassed;
    }

    isDropoffPassed(): boolean {
        if (!this.editingBookingId) return false;
        if (!this.manualBookingForm.endDate || !this.manualBookingForm.dropoffTime) {
            return false;
        }
        const dropoffDateTime = new Date(`${this.manualBookingForm.endDate}T${this.manualBookingForm.dropoffTime}:00`);
        return dropoffDateTime < new Date();
    }

    formatDisplayTime(time: string): string {
        return time || '10:00';
    }

    changeBookingMonth(type: 'pickup' | 'dropoff', delta: number, event: Event) {
        event.stopPropagation();
        event.preventDefault();
        const signal = type === 'pickup' ? this.bookingPickupCalendarMonth : this.bookingDropoffCalendarMonth;
        const current = signal();
        const newDate = new Date(current);
        newDate.setMonth(newDate.getMonth() + delta);
        signal.set(newDate);
    }

    getBookingMonthName(type: 'pickup' | 'dropoff'): string {
        const signal = type === 'pickup' ? this.bookingPickupCalendarMonth : this.bookingDropoffCalendarMonth;
        return signal().toLocaleString('es-CO', { month: 'long', year: 'numeric' });
    }

    deleteCategory() {
        const vehicle = this.selectedVehicle();
        if (!vehicle) return;

        if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${vehicle.name}"? Esta acción no se puede deshacer y eliminará todas las unidades asociadas.`)) {
            this.apiService.adminDeleteVehicle(vehicle.id).subscribe({
                next: () => {
                    alert('Categoría eliminada exitosamente.');
                    this.categoryMenuOpen.set(false);
                    this.closeCategoryDetail();
                    this.loadVehicles();
                },
                error: (err) => {
                    console.error('Error deleting category:', err);
                    alert('Error al eliminar la categoría: ' + (err.error?.message || err.message));
                }
            });
        }
    }

    deleteInstance(instance: any) {
        if (confirm(`¿Estás seguro de que deseas eliminar la unidad ${instance.identifier || instance.plate}? Esta acción no se puede rehacer.`)) {
            this.apiService.adminDeleteInstance(instance.id).subscribe({
                next: () => {
                    alert('Unidad eliminada exitosamente');
                    this.closeInstanceMenu();
                    if (this.selectedVehicle()) {
                        this.loadInstances(this.selectedVehicle().id);
                    }
                    this.loadVehicles(); // Update counts
                },
                error: (err) => {
                    console.error('Error deleting instance:', err);
                    alert('Error al eliminar la unidad: ' + (err.error?.message || err.message));
                }
            });
        }
    }

    onCategoryFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== 'image/webp' && !file.name.toLowerCase().endsWith('.webp')) {
                alert('Solo se permiten archivos .webp');
                event.target.value = '';
                this.selectedCategoryFile = null;
                return;
            }
            this.selectedCategoryFile = file;
        }
    }

    saveCategory() {
        if (!this.newCategoryForm.name || !this.newCategoryForm.base_price) {
            alert('Por favor completa el nombre y el precio base.');
            return;
        }

        this.categoryLoading.set(true);

        const formToSubmit = { ...this.newCategoryForm };

        // Include special_periods
        formToSubmit.special_periods = this.specialPeriods();

        // Prepare FormData for multipart upload
        const formData = new FormData();
        Object.keys(formToSubmit).forEach(key => {
            if (key === 'special_periods') {
                formData.append(key, JSON.stringify((formToSubmit as any)[key]));
            } else {
                formData.append(key, (formToSubmit as any)[key]);
            }
        });

        if (this.selectedCategoryFile) {
            formData.append('image', this.selectedCategoryFile);
        }

        const request = this.isEditingCategory()
            ? this.apiService.adminUpdateVehicle(this.selectedVehicle().id, formData)
            : this.apiService.adminCreateVehicle(formData);

        request.subscribe({
            next: () => {
                this.categoryLoading.set(false);
                this.showCreateCategoryModal.set(false);
                this.loadVehicles();

                if (this.isEditingCategory()) {
                    const currentVehicle = this.selectedVehicle();
                    this.apiService.adminGetVehicles().subscribe(data => {
                        const updated = data.find((v: any) => v.id === currentVehicle.id);
                        if (updated) this.selectedVehicle.set(updated);
                    });
                }

                alert(this.isEditingCategory() ? 'Categoría actualizada exitosamente.' : 'Categoría creada exitosamente.');
                this.isEditingCategory.set(false);
            },
            error: (err) => {
                this.categoryLoading.set(false);
                console.error('Error saving category:', err);
                alert('Error al guardar categoría: ' + (err.error?.message || err.message));
            }
        });
    }

    closeCategoryDetail() {
        this.selectedVehicle.set(null);
        this.selectedInstance.set(null);
    }

    loadInstances(vehicleId: number) {
        this.instancesLoading.set(true);
        this.apiService.adminGetInstances(vehicleId).subscribe({
            next: (data) => {
                const mappedInstances = data.map(i => ({
                    ...i,
                    identifier: i.plate || i.identifier || '',
                    status_label: this.mapStatus(i.current_status),
                    month_bookings_count: i.month_bookings_count || 0,
                    days_in_use: 0, // Will be calculated below
                    booking_action: ''
                }));

                this.instances.set(mappedInstances);
                this.instancesLoading.set(false);
                this.cdr.markForCheck();

                // For each booked instance, load bookings and calculate days in use
                // For each booked instance, load bookings and calculate days in use
                mappedInstances.forEach(instance => {
                    if (instance.current_status === 'booked') {
                        this.apiService.adminGetInstanceBookings(instance.id).subscribe(bookings => {
                            // Use local date for comparison to avoid UTC shifts
                            const now = new Date();
                            const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
                            const today = new Date(todayStr + 'T00:00:00'); // Local midnight

                            // Find active booking
                            const activeBooking = bookings.find((b: any) => {
                                if (b.status === 'maintenance') return false;
                                const start = (b.start_date || '').split('T')[0];
                                const end = (b.end_date || '').split('T')[0];
                                return todayStr >= start && todayStr <= end;
                            });

                            if (activeBooking) {
                                const start = (activeBooking.start_date || '').split('T')[0];
                                const end = (activeBooking.end_date || '').split('T')[0];

                                // Determine action
                                let action = '';
                                if (todayStr === end) action = 'dropoff';
                                else if (todayStr === start) action = 'pickup';

                                // Calculate remaining days
                                const endDate = new Date(end + 'T00:00:00');
                                const remainingDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                                // Update the instance
                                this.instances.update(list => list.map(inst =>
                                    inst.id === instance.id
                                        ? { ...inst, days_in_use: remainingDays, booking_action: action }
                                        : inst
                                ));
                                this.cdr.markForCheck();
                            }
                        });
                    }
                });
            }
        });
    }

    private mapStatus(status: string): string {
        switch (status) {
            case 'available': return 'Disponible';
            case 'booked': return 'Reservado';
            case 'maintenance': return 'Mantenimiento';
            default: return status || 'Disponible';
        }
    }

    selectInstance(instance: any) {
        this.selectedInstance.set(instance);
        this.loadInstanceBookings(instance.id);
        this.selectedCalendarEvent.set(null);
    }

    loadInstanceBookings(instanceId: number) {
        this.instanceBookingsLoading.set(true);
        this.apiService.adminGetInstanceBookings(instanceId).subscribe(data => {
            this.instanceBookings.set(data);
            this.instanceBookingsLoading.set(false);
            this.cdr.markForCheck();
        });
    }

    navigateView(delta: number) {
        const d = new Date(this.currentDate());
        const mode = this.viewMode();

        if (mode === 'month') {
            d.setMonth(d.getMonth() + delta);
        } else if (mode === 'quarter') {
            d.setMonth(d.getMonth() + (delta * 3));
        } else if (mode === 'semester') {
            d.setMonth(d.getMonth() + (delta * 6));
        }

        this.currentDate.set(d);
    }

    setViewMode(mode: 'month' | 'quarter' | 'semester') {
        this.viewMode.set(mode);
    }

    currentMonthName = computed(() => {
        const d = this.currentDate();
        return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(d);
    });

    currentYear = computed(() => this.currentDate().getFullYear());

    calendarDaysComputed = computed(() => {
        const d = this.currentDate();
        const year = d.getFullYear();
        const month = d.getMonth();
        const start = new Date(year, month, 1);
        const dayOfWeek = start.getDay();
        const grid = [];

        const gridStart = new Date(start);
        gridStart.setDate(gridStart.getDate() - dayOfWeek);

        let daysToShow = 35; // Default 5 weeks for Month view
        if (this.viewMode() === 'quarter') daysToShow = 91; // ~3 months (13 weeks)
        if (this.viewMode() === 'semester') daysToShow = 182; // ~6 months (26 weeks)

        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(gridStart);
            date.setDate(date.getDate() + i);
            grid.push({
                dayNum: date.getDate(),
                isOtherMonth: date.getMonth() !== month && this.viewMode() === 'month', // Only dim other month days in month view
                isToday: this.isSameDay(date, new Date()),
                events: this.getEventsForDate(date)
            });
        }
        return grid;
    });

    getEventsForDate(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const evs: any[] = [];
        const bookings = this.instanceBookings();

        // 1. Identify if there's maintenance today for this unit
        const hasMaintenance = bookings.some(b =>
            b.status === 'maintenance' &&
            dateStr >= (b.start_date || '').split('T')[0] &&
            dateStr <= (b.end_date || '').split('T')[0]
        );

        bookings.forEach(b => {
            if (!b.start_date || !b.end_date) return;
            const s = b.start_date.split('T')[0];
            const e = b.end_date.split('T')[0];

            if (dateStr >= s && dateStr <= e) {
                if (b.status === 'maintenance') {
                    if (this.showMaintenance()) {
                        evs.push({ type: 'maintenance', title: 'MANT.', tooltip: b.notes, data: b });
                    }
                } else if (b.status === 'cancelled') {
                    // Show cancelled bookings in red
                    let type = 'cancelled';
                    let title = 'CANC.';

                    if (dateStr === s) {
                        if (this.showPickups()) { type = 'cancelled-start'; title = 'RETIRO (C)'; }
                    } else if (dateStr === e) {
                        if (this.showDropoffs()) { type = 'cancelled-end'; title = 'ENTREGA (C)'; }
                    }

                    evs.push({
                        type,
                        title,
                        data: b,
                        isConflicting: false
                    });
                } else {
                    let type = '';
                    let title = '';
                    if (dateStr === s) {
                        if (this.showPickups()) { type = 'start'; title = 'RETIRO'; }
                    } else if (dateStr === e) {
                        if (this.showDropoffs()) { type = 'end'; title = 'ENTREGA'; }
                    } else {
                        type = 'booked'; title = 'RES.';
                    }

                    if (type) {
                        evs.push({
                            type,
                            title,
                            data: b,
                            isConflicting: hasMaintenance
                        });
                    }
                }
            }
        });

        // Sort: maintenance first so conflict shows below
        evs.sort((a, b) => (a.type === 'maintenance' ? -1 : (b.type === 'maintenance' ? 1 : 0)));

        return evs;
    }



    getStatusSubtitle(instance: any): string {
        if (instance.current_status === 'booked') {
            if (instance.booking_action === 'dropoff') return 'ENTREGA HOY';
            if (instance.booking_action === 'pickup') return 'RETIRO HOY';

            const days = this.getDaysInUse(instance);
            return `${days} Días Restantes`;
        } else if (instance.current_status === 'available') {
            const count = this.getMonthBookingsCount(instance.id);
            return `${count} Reservas`;
        }
        return `${instance.days_off || 0} Días Off`;
    }

    getDaysInUse(instance: any): number {
        // Return calculated days_in_use (computed in loadInstances for booked vehicles)
        return instance.days_in_use || 0;
    }

    getMonthBookingsCount(instanceId: number): number {
        // This is tricky without fetching bookings for ALL instances. 
        // If 'adminGetInstances' returns 'month_bookings_count', use it.
        // Otherwise we can only show accurate count for the SELECTED instance.
        // We will presume the 'instance' object from API has this field or we default to 0.
        // Let's check 'loadInstances'.
        return 0; // Placeholder until backend support or we pre-load.
    }

    onEventClick(event: any) {
        this.selectedCalendarEvent.set(event);
    }

    onOverrideStatusChange() {
        if (this.overrideStatus === 'booked') {
            this.openManualBookingModal();
        } else if (this.overrideStatus === 'available') {
            this.blockStart = '';
            this.blockEnd = '';
            this.blockReason = '';
        }
    }

    openManualBookingModal() {
        // Refresh both category and instance data to ensure prices are current from DB
        const ins = this.selectedInstance();
        const cat = this.selectedVehicle();

        if (ins && cat) {
            // Fetch fresh data for both category and instances
            forkJoin([
                this.apiService.adminGetVehicles(),
                this.apiService.adminGetInstances(cat.id)
            ]).subscribe({
                next: ([vehicles, instances]: [any[], any[]]) => {
                    // Update vehicles and find fresh category
                    this.vehicles.set(vehicles);
                    const freshCat = vehicles.find(v => v.id === cat.id);
                    if (freshCat) {
                        this.selectedVehicle.set(freshCat);
                    }

                    // Update instances and find fresh instance
                    this.instances.set(instances);
                    const freshInstance = instances.find(i => i.id === ins.id);
                    if (freshInstance) {
                        this.selectedInstance.set(freshInstance);
                    }

                    // Now open the modal with fresh data
                    this.resetManualBookingForm();
                    this.showManualBookingModal.set(true);
                },
                error: () => {
                    // If refresh fails, still open modal with current data
                    this.resetManualBookingForm();
                    this.showManualBookingModal.set(true);
                }
            });
        } else {
            // No instance selected, just open modal
            this.resetManualBookingForm();
            this.showManualBookingModal.set(true);
        }
    }

    submitOverride() {
        const ins = this.selectedInstance();
        if (!ins) return;

        // If target status is available, check current status
        if (this.overrideStatus === 'available') {
            // If already available, do nothing (no alert, no update)
            if (ins.current_status === 'available') {
                return;
            }
            // If currently booked, ask for confirmation
            if (ins.current_status === 'booked') {
                if (!confirm('El vehículo se encuentra en una reserva activa. Si lo liberas como disponible ahora, la reserva será detenida de inmediato. ¿Estás seguro de que deseas continuar?')) {
                    return;
                }
            }
        }

        // Validation: Maintenance/Booked requires dates
        if (this.overrideStatus !== 'available' && (!this.blockStart || !this.blockEnd)) {
            alert('Por favor selecciona las fechas para el bloqueo.');
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const data: any = {
            category_id: ins.category_id,
            status: this.overrideStatus,
            start_date: this.overrideStatus === 'available' ? todayStr : this.blockStart,
            end_date: this.overrideStatus === 'available' ? todayStr : this.blockEnd,
            notes: this.blockReason || ''
        };

        console.log('Overrides submission:', data, ins);

        // Logic for Maintenance on Booked Vehicle
        if (this.overrideStatus === 'maintenance') {
            // Find ALL bookings (confirmed/active) that overlap with the block
            const overlappingBookings = this.instanceBookings().filter(b => {
                const s = (b.start_date || '').split('T')[0];
                const e = (b.end_date || '').split('T')[0];
                return (b.status === 'confirmed' || b.status === 'active') &&
                    (this.blockStart <= e && this.blockEnd >= s);
            });

            if (overlappingBookings.length > 0) {
                const codes = overlappingBookings.map(b => b.code).join(', ');
                if (confirm(`${overlappingBookings.length} reserva(s) (${codes}) coinciden con las fechas de mantenimiento.\n\nLas reservas se marcarán como PENDIENTES y aparecerán en gris en el calendario.\n\n¿Deseas continuar?`)) {
                    // Update all to pending using forkJoin
                    const observables = overlappingBookings.map(b =>
                        this.apiService.adminUpdateBookingStatus(b.id, 'pending')
                    );

                    // Assuming forkJoin is imported from 'rxjs'
                    // import { forkJoin } from 'rxjs';
                    forkJoin(observables).subscribe({
                        next: () => {
                            this.executeOverride(ins.id, data);
                        },
                        error: (err) => alert('Error al actualizar las reservas: ' + (err.error?.message || err.message))
                    });
                    return;
                } else {
                    // User cancelled the action
                    return;
                }
            }
        }

        this.executeOverride(ins.id, data);
    }

    executeOverride(instanceId: number, data: any) {
        this.apiService.adminOverrideInstance(instanceId, data).subscribe({
            next: () => {
                // Success feedback
                const statusMsg = this.overrideStatus === 'available' ? 'ahora está disponible' : 'actualizada';
                alert(`Unidad ${statusMsg} correctamente.`);

                this.loadInstanceBookings(instanceId);
                if (this.selectedVehicle()) {
                    this.loadInstances(this.selectedVehicle().id);
                }

                // Reset form
                this.blockStart = '';
                this.blockEnd = '';
                this.blockReason = '';
                this.overrideStatus = 'maintenance'; // Reset to default
            },
            error: (err) => {
                console.error('Error overriding instance:', err);
                let msg = 'Error desconocido';
                if (err.error && typeof err.error === 'object') {
                    msg = err.error.message || JSON.stringify(err.error);
                } else if (err.message) {
                    msg = err.message;
                }
                alert('Ocurrió un error al actualizar el estado: ' + msg);
            }
        });
    }

    openCreateModal() {
        const v = this.selectedVehicle();
        let defaultWash = 35000;

        if (v) {
            const type = (v.category_type || '').toUpperCase();
            // "SUV o más grandes" logic
            if (type === 'SUV' || type === 'VAN') {
                defaultWash = 40000;
            }
        }

        this.newInstanceForm = {
            plate: '',
            wash_price: defaultWash,
            status: 'active'
        };
        this.showCreateInstanceModal.set(true);
    }

    formatNewPlate(val: string) {
        if (!val) return;
        let c = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (c.length > 3) {
            this.newInstanceForm.plate = c.substring(0, 3) + '-' + c.substring(3, 6);
        } else {
            this.newInstanceForm.plate = c;
        }
    }

    saveNewInstance() {
        const v = this.selectedVehicle();
        if (!v || !this.newInstanceForm.plate) return;
        const data = {
            vehicle_id: v.id,
            identifier: this.newInstanceForm.plate,
            is_active: 1,
            wash_price: this.newInstanceForm.wash_price || 0
        };
        this.apiService.adminCreateInstance(data).subscribe(() => {
            this.showCreateInstanceModal.set(false);
            this.loadInstances(v.id);
            this.newInstanceForm.plate = '';
        });
    }

    editingBookingId: number | null = null;

    openEditModal(booking: any, type: string) {
        this.editingBookingId = booking.id;
        this.showManualBookingModal.set(true);
        this.manualBookingLoading.set(true);

        // Fetch fresh data from DB to ensure synchronization
        this.apiService.adminGetBooking(booking.id).subscribe({
            next: (freshBooking) => {
                this.manualBookingLoading.set(false);
                this.populateEditForm(freshBooking);
            },
            error: (err) => {
                this.manualBookingLoading.set(false);
                console.error('Error fetching booking details', err);
                alert('Error al cargar los detalles de la reserva.');
                this.showManualBookingModal.set(false);
            }
        });
    }

    isMaintenanceBooking = signal(false);
    editingBookingStatus = signal<string>('');

    cancelCurrentBooking(booking?: any) {
        const id = booking?.id || this.editingBookingId;
        if (!id) return;

        if (confirm('¿Estás seguro de que deseas cancelar esta reserva? Esta acción liberará la disponibilidad del vehículo.')) {
            this.manualBookingLoading.set(true);
            this.apiService.adminUpdateBookingStatus(id, 'cancelled').subscribe({
                next: () => {
                    alert('Reserva cancelada correctamente.');
                    if (this.showManualBookingModal() && this.editingBookingId === id) {
                        this.closeManualBookingModal();
                    }
                    // Refresh data
                    if (this.selectedVehicle()) {
                        this.loadInstances(this.selectedVehicle().id);
                    }

                    // Update viewer if needed
                    if (this.selectedCalendarEvent()?.data?.id === id) {
                        const updated = { ...this.selectedCalendarEvent().data, status: 'cancelled' };
                        this.selectedCalendarEvent.set({ ...this.selectedCalendarEvent(), data: updated });
                    }
                    this.manualBookingLoading.set(false);
                },
                error: (err) => {
                    this.manualBookingLoading.set(false);
                    console.error('Error cancelling booking', err);
                    alert('Error al cancelar la reserva: ' + (err.error?.message || err.message));
                }
            });
        }
    }

    populateEditForm(booking: any) {
        this.isMaintenanceBooking.set(booking.status === 'maintenance');
        this.editingBookingStatus.set(booking.status);
        const v = this.selectedVehicle();
        const instance = this.selectedInstance();

        // Calculate if pickup already passed based on SAVED data
        if (booking.start_date && booking.pickup_time) {
            const savedStart = new Date(`${booking.start_date.split('T')[0]}T${booking.pickup_time.substring(0, 5)}:00`);
            this.wasPickupPassed = savedStart < new Date();
        } else {
            this.wasPickupPassed = false;
        }

        // Defaults
        let defaultDayPrice = v ? (v.price_per_day || 0) : 0;

        // IMPORTANT: Use wash_rate from the booking itself first (what was saved for this specific booking)
        // Fallback to instance/vehicle default only if not set
        let wash = 35000;
        if (booking.wash_rate !== undefined && booking.wash_rate !== null) {
            wash = Number(booking.wash_rate);
        } else {
            const actualInstance = this.instances().find(i => i.id === booking.vehicle_id) || instance;
            if (actualInstance && actualInstance.wash_price) {
                wash = Number(actualInstance.wash_price);
            } else if (v && v.wash_price) {
                wash = Number(v.wash_price);
            }
        }

        // Load additional costs from the dedicated column, fallback to parsing from notes for legacy data
        let additionalCosts: { name: string, price: number }[] = [];
        let cleanNotes = booking.notes || '';

        // First, try to load from the additional_costs column (new system)
        if (booking.additional_costs) {
            try {
                const parsed = typeof booking.additional_costs === 'string'
                    ? JSON.parse(booking.additional_costs)
                    : booking.additional_costs;
                if (Array.isArray(parsed)) {
                    additionalCosts = parsed.map((c: any) => ({
                        name: c.name || '',
                        price: Number(c.price) || 0
                    }));
                }
            } catch (e) {
                console.error('Error parsing additional_costs:', e);
            }
        }

        // Fallback: Parse from notes if additional_costs column is empty (legacy data)
        if (additionalCosts.length === 0) {
            const costMarker = '\n\n[Costos Adicionales]:';
            if (cleanNotes.includes(costMarker)) {
                const parts = cleanNotes.split(costMarker);
                cleanNotes = parts[0].trim();
                const costsPart = parts[1];
                // Format is: "- Name: $Price"
                const lines = costsPart.split('\n');
                lines.forEach((line: string) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('- ') && trimmed.includes(': $')) {
                        const content = trimmed.substring(2);
                        const segments = content.split(': $');
                        if (segments.length === 2) {
                            const name = segments[0].trim();
                            const price = Number(segments[1].replace(/,/g, '').trim());
                            if (!isNaN(price)) {
                                additionalCosts.push({ name, price });
                            }
                        }
                    }
                });
            }
        } else {
            // If we loaded from column, also clean up notes that might have the legacy format
            const costMarker = '\n\n[Costos Adicionales]:';
            if (cleanNotes.includes(costMarker)) {
                cleanNotes = cleanNotes.split(costMarker)[0].trim();
            }
        }

        // Derive actual Base Price from Total
        const total = Number(booking.total_price) || 0;
        const extrasSum = additionalCosts.reduce((acc, curr) => acc + curr.price, 0);

        // Calculate Days
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = daysDiff > 0 ? daysDiff : 1;

        // Estimated Base Price = (Total - Wash - Extras) / Days
        const derivedBase = Math.round((total - wash - extrasSum) / totalDays);

        // Populate form
        this.manualBookingForm = {
            fullName: booking.customer_name || '',
            email: booking.customer_email || '',
            phone: booking.customer_phone || '',
            ddi: booking.customer_phone_code || '+57',
            nationality: booking.customer_nationality || 'Colombia',
            docType: booking.customer_doc_type || 'CC',
            docNumber: booking.customer_doc_number || '',
            startDate: booking.start_date ? booking.start_date.split(/T| /)[0] : '',
            endDate: booking.end_date ? booking.end_date.split(/T| /)[0] : '',
            // Ensure time is in HH:00 format
            pickupTime: booking.pickup_time ? (booking.pickup_time.substring(0, 2) + ':00') : '10:00',
            dropoffTime: booking.dropoff_time ? (booking.dropoff_time.substring(0, 2) + ':00') : '10:00',
            pickupLocation: booking.pickup_location || 'Cartagena',
            dropoffLocation: booking.dropoff_location || 'Cartagena',
            totalPrice: total,
            notes: cleanNotes,

            // New Editable Price Fields: Prioritize saved daily_rate from DB
            pricePerDay: booking.daily_rate ? Number(booking.daily_rate) : (derivedBase > 0 ? derivedBase : defaultDayPrice),
            washFee: wash,
            additionalCosts: additionalCosts,
            createdAt: booking.created_at || null,
            notifyAdmin: false,
            notifyUser: false
        };

        this.calculateManualPrice('other');
        // IMPORTANT: Restore the exact saved total price 
        if (booking.total_price) {
            this.manualBookingForm.totalPrice = Number(booking.total_price);
        }
    }

    saveEditedBooking() {
        if (!this.editingBookingId) return;
        const form = this.manualBookingForm;

        this.manualBookingLoading.set(true);

        const payload = {
            start_date: form.startDate,
            end_date: form.endDate,
            pickup_time: form.pickupTime,
            dropoff_time: form.dropoffTime,
            pickup_location: form.pickupLocation,
            dropoff_location: form.dropoffLocation,
            total_price: Number(form.totalPrice),
            customer_name: form.fullName,
            customer_email: form.email,
            customer_phone: form.phone,
            customer_phone_code: form.ddi,
            customer_doc_type: form.docType,
            customer_doc_number: form.docNumber,
            customer_nationality: form.nationality,
            daily_rate: Number(form.pricePerDay),
            wash_rate: Number(form.washFee),
            additional_costs: JSON.stringify(form.additionalCosts || []),

            // Sync with creation payload
            insurance: 'basic',
            customerDetails: {
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                ddi: form.ddi,
                nationality: form.nationality,
                docType: form.docType,
                docNumber: form.docNumber
            },
            notes: form.notes || '',
            notify_admin: form.notifyAdmin,
            notify_user: form.notifyUser
        };

        const instance = this.selectedInstance();
        const observables = [this.apiService.adminUpdateBooking(this.editingBookingId, payload)];

        forkJoin(observables).subscribe({
            next: (res) => {
                this.manualBookingLoading.set(false);
                alert('Reserva actualizada exitosamente.');
                this.closeManualBookingModal();

                // Refresh data
                if (instance) {
                    this.loadInstanceBookings(instance.id);
                    // Also reload instances to reflect new wash price if updated
                    this.loadInstances(instance.category_id);
                }

                // Force update the selected event view directly
                if (this.selectedCalendarEvent()?.data?.id === this.editingBookingId) {
                    const updated = { ...this.selectedCalendarEvent().data, ...payload };
                    this.selectedCalendarEvent.set({ ...this.selectedCalendarEvent(), data: updated });
                }
            },
            error: (err) => {
                this.manualBookingLoading.set(false);
                console.error('Error updating booking:', err);
                const msg = err.error?.error || err.error?.message || err.message;
                alert('Error al actualizar reserva: ' + msg);
            }
        });
    }

    deleteBooking(booking?: any) {
        const b = booking || this.selectedCalendarEvent()?.data;
        if (!b) return;

        if (confirm(`¿Estás seguro de que deseas eliminar la reserva ${b.code || 'ID: ' + b.id}? Esta acción no se puede deshacer.`)) {
            this.manualBookingLoading.set(true);
            this.apiService.adminDeleteBooking(b.id).subscribe({
                next: () => {
                    this.manualBookingLoading.set(false);
                    alert('Reserva eliminada exitosamente.');
                    if (this.showManualBookingModal()) {
                        this.closeManualBookingModal();
                    }
                    this.selectedCalendarEvent.set(null);
                    this.refreshCurrentBooking();
                },
                error: (err) => {
                    this.manualBookingLoading.set(false);
                    console.error('Error deleting booking:', err);
                    alert('Error al eliminar reserva: ' + (err.error?.message || err.message));
                }
            });
        }
    }

    refreshCurrentBooking() {
        const instance = this.selectedInstance();
        if (!instance) return;

        this.instancesLoading.set(true);

        // Use the API service to fetch fresh bookings
        this.apiService.adminGetInstanceBookings(instance.id).subscribe({
            next: (bookings: any[]) => {
                // IMPORTANT: Update 'instanceBookings' because that is what 'calendarDaysComputed' uses
                this.instanceBookings.set(bookings);
                this.instancesLoading.set(false);
                this.cdr.markForCheck();

                // If we are viewing a specific event, try to find it in the new list and update the view
                const currentEvent = this.selectedCalendarEvent();
                if (currentEvent && currentEvent.data) {
                    const freshBooking = bookings.find(b => b.id === currentEvent.data.id);
                    if (freshBooking) {
                        this.selectedCalendarEvent.set({
                            ...currentEvent,
                            data: freshBooking
                        });
                    }
                }
            },
            error: (err) => {
                this.instancesLoading.set(false);
                console.error('Error refreshing bookings', err);
            }
        });

        // Also refresh general fleet status in background
        this.loadVehicles();
        if (instance.category_id) {
            this.loadInstances(instance.category_id);
        }
    }



    // --- Manual Booking Calculation Logic ---
    calculateManualPrice(source: 'date' | 'price' | 'other' = 'date') {
        const form = this.manualBookingForm;
        if (!form.startDate || !form.endDate || !this.selectedVehicle()) return;

        // 1. Parse Dates
        const start = new Date(form.startDate + 'T' + (form.pickupTime || '00:00') + ':00');
        const end = new Date(form.endDate + 'T' + (form.dropoffTime || '00:00') + ':00');

        if (end <= start) {
            this.manualBookingForm.totalPrice = 0;
            return;
        }

        // 2. Calculate Days (24h rule)
        const diffMs = end.getTime() - start.getTime();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const finalDays = days > 0 ? days : 1;

        // 3. Determine Base Price (Daily)
        let totalBase = 0;
        let avgPrice = 0;

        if (source === 'other' || source === 'price') {
            // Use current form values for manual recalculation (reload button or manual price edit)
            const currentPricePerDay = Number(form.pricePerDay) || 0;
            totalBase = finalDays * currentPricePerDay;
            avgPrice = currentPricePerDay;
        } else {
            // source === 'date' - Recalculate from category's base_price and special_periods
            const cat = this.selectedVehicle();

            // Default to base_price
            let pBase = Number(cat.base_price) || 0;

            // Parse special_periods JSON
            let specialPeriods: any[] = [];
            if (typeof cat.special_periods === 'string') {
                try { specialPeriods = JSON.parse(cat.special_periods); } catch (e) { }
            } else if (Array.isArray(cat.special_periods)) {
                specialPeriods = cat.special_periods;
            }

            let current = new Date(start);
            const seasonNamesSet = new Set<string>();

            // Iterate through each day in the booking range
            for (let i = 0; i < finalDays; i++) {
                const dateStr = current.toISOString().split('T')[0];

                // Check if this date falls within any special period
                const matchingPeriod = specialPeriods.find((p: any) =>
                    dateStr >= p.start && dateStr <= p.end
                );

                let dailyRate = pBase;
                if (matchingPeriod && matchingPeriod.price) {
                    dailyRate = Number(matchingPeriod.price);
                    if (matchingPeriod.name) seasonNamesSet.add(matchingPeriod.name);
                }

                totalBase += dailyRate;

                // Advance 1 day
                current.setDate(current.getDate() + 1);
            }

            // Update form price to Average (for display)
            avgPrice = Math.round(totalBase / finalDays);
            this.manualBookingForm.pricePerDay = avgPrice;
            this.activeSeasonNames.set(Array.from(seasonNamesSet));
        }

        // 4. Wash Fee (Use current form value)
        const wash = Number(form.washFee) || 0;

        // 5. Dropoff Fees
        const cityFees: Record<string, number> = {
            'Cartagena': 0, 'Barranquilla': 250000, 'Santa Marta': 350000
        };
        const dropFee = (form.pickupLocation !== form.dropoffLocation)
            ? (cityFees[form.dropoffLocation] || 0)
            : 0;

        // 6. Additional Costs
        const additionalSum = (form.additionalCosts || []).reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

        // Final Total: Include Dropoff Fee in the total calculation
        this.manualBookingForm.totalPrice = Number(totalBase) + wash + additionalSum + dropFee;

        // Update Breakdown
        this.breakdownData = {
            days: finalDays,
            baseTotal: totalBase,
            wash: wash,
            dropoff: dropFee
        };
        this.cdr.markForCheck();
    }

    addAdditionalCost() {
        if (!this.newCostName || this.newCostPrice === null) return;
        this.manualBookingForm.additionalCosts.push({
            name: this.newCostName,
            price: this.newCostPrice
        });
        this.newCostName = '';
        this.newCostPrice = null;
        this.calculateManualPrice('other');
    }

    removeAdditionalCost(index: number) {
        this.manualBookingForm.additionalCosts.splice(index, 1);
        this.calculateManualPrice('other');
    }

    saveManualBooking() {
        const form = this.manualBookingForm;
        if (!form.fullName || !form.email || !form.phone || !form.startDate || !form.endDate) {
            alert('Por favor completa los campos obligatorios (*).');
            return;
        }

        const v = this.selectedVehicle();
        if (!v) return;

        this.manualBookingLoading.set(true);

        // Code generator matching Paso 4 logic
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
        let bookingCode = '';
        for (let i = 0; i < length; i++) {
            bookingCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const payload = {
            category_id: v.id,
            start_date: form.startDate,
            end_date: form.endDate,
            total_price: Number(form.totalPrice),
            daily_rate: Number(form.pricePerDay),
            wash_rate: Number(form.washFee),
            additional_costs: JSON.stringify(form.additionalCosts || []),
            pickup_location: form.pickupLocation,
            dropoff_location: form.dropoffLocation,
            pickup_time: form.pickupTime,
            dropoff_time: form.dropoffTime,
            status: 'confirmed',
            code: bookingCode,

            // Customer Info
            customer_name: form.fullName,
            customer_email: form.email,
            customer_phone: form.phone,
            customer_phone_code: form.ddi,
            customer_doc_type: form.docType,
            customer_doc_number: form.docNumber,
            customer_nationality: form.nationality,

            insurance_type: 'basic',
            is_manual_admin_booking: true,
            force_vehicle_id: this.selectedInstance()?.id,
            notify_admin: form.notifyAdmin === true,
            notify_user: form.notifyUser === true,
            customerDetails: {
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                ddi: form.ddi,
                nationality: form.nationality,
                docType: form.docType,
                docNumber: form.docNumber
            },

            notes: form.notes
        };

        this.apiService.adminCreateBooking(payload).subscribe({
            next: (res) => {
                this.manualBookingLoading.set(false);
                alert('Reserva manual creada exitosamente. Código: ' + (res.code || bookingCode));
                this.closeManualBookingModal();
                if (this.selectedInstance()) {
                    this.loadInstanceBookings(this.selectedInstance().id);
                }
                this.loadVehicles(); // Refresh stock counts
            },
            error: (err) => {
                this.manualBookingLoading.set(false);
                console.error('Error creating manual booking:', err);
                const errorMsg = err.error?.error || err.error?.message || err.message || 'Error desconocido';
                alert('Error al crear reserva: ' + errorMsg);
            }
        });
    }

    private isSameDay(d1: Date, d2: Date) {
        return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    }

    private parseDateSafe(dateIn: string | Date): Date {
        if (dateIn instanceof Date) return dateIn;
        if (!dateIn) return new Date();

        // If strict YYYY-MM-DD
        if (typeof dateIn === 'string' && dateIn.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = dateIn.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return new Date(dateIn);
    }

    isBookingPast(b: any): boolean {
        if (!b) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Use end_date if available
        const dateStr = b.end_date || b.date;
        if (!dateStr) return false;

        const eventEnd = this.parseDateSafe(dateStr);
        // Set to end of day to include the day itself until midnight passed
        eventEnd.setHours(23, 59, 59, 999);

        return eventEnd < today;
    }

    getStatusColor(status: string) {
        if (status === 'maintenance') return 'text-orange-500';
        if (status === 'booked') return 'text-blue-600';
        return 'text-green-600';
    }

    getEventClass(ev: any) {
        // Check if event is in the past (historic)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const eventEnd = this.parseDateSafe(ev.data?.end_date || ev.date || today);
        eventEnd.setHours(23, 59, 59, 999);

        // Conflict check (High Priority styling)
        if (ev.isConflicting) {
            return {
                'bg-slate-100 text-slate-700 border border-slate-200 opacity-80': true
            };
        }

        if (ev.type === 'cancelled' || ev.type === 'cancelled-start' || ev.type === 'cancelled-end') {
            return 'bg-white text-red-600 border border-red-600 line-through font-bold';
        }

        if (eventEnd < today) {
            return 'bg-gray-200 text-gray-500'; // Historical
        }

        return {
            'bg-green-100 text-green-800': ev.type === 'start',
            'bg-red-100 text-red-700': ev.type === 'end',
            'bg-blue-100 text-blue-700': ev.type === 'booked',
            'bg-orange-100 text-orange-700': ev.type === 'maintenance'
        };
    }

    getEventLabel(ev: any): string {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventEnd = this.parseDateSafe(ev.data?.end_date || ev.date || today);
        eventEnd.setHours(23, 59, 59, 999);

        if (eventEnd < today) return 'FINALIZADO';

        switch (ev.type) {
            case 'start': return 'INICIO DE RESERVA';
            case 'end': return 'FIN DE RESERVA';
            case 'booked': return 'RESERVA EN CURSO';
            case 'maintenance': return 'MANTENIMIENTO';
            case 'cancelled':
            case 'cancelled-start':
            case 'cancelled-end': return 'RESERVA CANCELADA';
            default: return 'EVENTO';
        }
    }

    formatFullDate(date: Date | string): string {
        const d = this.parseDateSafe(date);
        return new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(d);
    }

    // --- Instance Menu ---
    activeInstanceMenu = signal<number | null>(null);

    toggleInstanceMenu(id: number, event: Event, instance?: any) {
        event.stopPropagation();
        if (this.activeInstanceMenu() === id) {
            this.activeInstanceMenu.set(null);
        } else {
            this.activeInstanceMenu.set(id);
            if (instance) {
                this.selectInstance(instance);
                setTimeout(() => {
                    const el = document.getElementById('inventoryRightPanel');
                    if (el) el.scrollTop = 0;
                }, 0);
            }
        }
    }

    closeInstanceMenu() {
        this.activeInstanceMenu.set(null);
    }

    // --- Edit Rates Logic ---
    showEditRatesModal = signal(false);
    editRatesData = {
        instanceId: 0,
        categoryId: 0,
        currentWashPrice: 0,
        currentCategoryPrice: 0, // Base/Low Season Price
        instanceIndentifier: '',
        seasonalRates: [] as { name: string, start: string, end: string, price: number }[]
    };

    openEditRatesModal(instance: any) {
        this.closeInstanceMenu();
        const cat = this.selectedVehicle();
        if (!cat) return;

        // Parse existing rates
        let existingRates: any[] = [];
        try {
            existingRates = typeof cat.seasonal_rates === 'string' ? JSON.parse(cat.seasonal_rates) : (cat.seasonal_rates || []);
        } catch (e) { existingRates = []; }

        // Sanitize existing rates to match structure
        if (!Array.isArray(existingRates)) existingRates = [];

        this.editRatesData = {
            instanceId: instance.id,
            categoryId: cat.id,
            currentWashPrice: instance.wash_price || 0,
            // Check for Instance Override, fallback to null (user will enter new override) or existing override
            // Note: If instance.price_per_day is null, we might want to show empty or 0.
            currentCategoryPrice: instance.price_per_day ? Number(instance.price_per_day) : 0,
            instanceIndentifier: instance.identifier || instance.plate,
            seasonalRates: [] // NOT USED HERE ANYMORE
        };
        this.showEditRatesModal.set(true);
    }

    addSeasonalRate() {
        this.editRatesData.seasonalRates.push({
            name: 'Nueva Temporada',
            start: '',
            end: '',
            price: 0
        });
    }

    removeSeasonalRate(index: number) {
        this.editRatesData.seasonalRates.splice(index, 1);
    }

    saveRates() {
        // Only Update Instance (Wash & Individual Price Override)
        // Note: seasonal_rates are no longer updated here.
        this.apiService.adminUpdateInstance(this.editRatesData.instanceId, {
            wash_price: this.editRatesData.currentWashPrice,
            price_per_day: this.editRatesData.currentCategoryPrice > 0 ? this.editRatesData.currentCategoryPrice : null
        }).subscribe({
            next: () => {
                const editedInstanceId = this.editRatesData.instanceId;
                const catId = this.editRatesData.categoryId; // Kept for reference to refresh UI

                // 2. Reload Instances to reflect changes
                this.loadInstances(catId);

                // Update local selectedInstance immediately for better UX
                const currentSelected = this.selectedInstance();
                if (currentSelected && currentSelected.id === editedInstanceId) {
                    const updatedInst = {
                        ...currentSelected,
                        wash_price: this.editRatesData.currentWashPrice,
                        price_per_day: this.editRatesData.currentCategoryPrice > 0 ? this.editRatesData.currentCategoryPrice : null
                    };
                    this.selectedInstance.set(updatedInst);
                }

                this.showEditRatesModal.set(false);
                alert('Costos de unidad actualizados correctamente.');
            },
            error: (err) => {
                console.error(err);
                alert('Error al actualizar costos.');
            }
        });
    }

    // --- Custom Date Picker ---
    pickerMode = signal<'start' | 'end' | null>(null);
    weekDays = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

    get pickerDays() {
        const year = this.pickerViewDate().getFullYear();
        const month = this.pickerViewDate().getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        let firstDayIndex = firstDay.getDay();
        for (let i = 0; i < firstDayIndex; i++) days.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
        return days;
    }

    togglePicker(mode: 'start' | 'end', event: Event) {
        event.stopPropagation();
        if (this.pickerMode() === mode) {
            this.closePicker();
        } else {
            this.pickerMode.set(mode);
            const currentVal = mode === 'start' ? this.blockStart : this.blockEnd;
            if (currentVal) {
                const [y, m, d] = currentVal.split('-').map(Number);
                this.pickerViewDate.set(new Date(y, m - 1, d));
            } else {
                this.pickerViewDate.set(new Date());
            }
        }
    }

    closePicker() {
        this.pickerMode.set(null);
    }

    changePickerMonth(delta: number, event: Event) {
        event.stopPropagation();
        const d = new Date(this.pickerViewDate());
        d.setMonth(d.getMonth() + delta);
        this.pickerViewDate.set(d);
    }

    selectPickerDate(date: Date, event: Event) {
        event.stopPropagation();
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const str = `${y}-${m}-${d}`;

        if (this.pickerMode() === 'start') {
            this.blockStart = str;
        } else {
            this.blockEnd = str;
        }
        this.closePicker();
    }

    isDateSelected(date: Date): boolean {
        const mode = this.pickerMode();
        const target = mode === 'start' ? this.blockStart : this.blockEnd;
        if (!target) return false;
        const [y, m, d] = target.split('-').map(Number);
        return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    }

    isToday(date: Date): boolean {
        const now = new Date();
        return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    formatMonthYear(date: Date): string {
        const m = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date).toUpperCase();
        const y = date.getFullYear();
        return `${m} ${y}`;
    }

    // --- Custom Status Dropdown ---
    statusDropdownOpen = signal(false);

    toggleStatusDropdown(event: Event) {
        event.stopPropagation();
        this.statusDropdownOpen.update(v => !v);
    }

    selectStatus(status: string, event: Event) {
        event.stopPropagation();
        this.overrideStatus = status;
        this.onOverrideStatusChange();
        this.statusDropdownOpen.set(false);
    }
    isDateDisabled(date: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Cannot select past dates
        if (date < today) return true;

        // If selecting End date, cannot be before Start date
        if (this.pickerMode() === 'end' && this.blockStart) {
            const [y, m, d] = this.blockStart.split('-').map(Number);
            const start = new Date(y, m - 1, d);
            start.setHours(0, 0, 0, 0);
            if (date < start) return true;
        }

        return false;
    }

    // --- Bookings State ---
    bookings = signal<any[]>([]);

    closeManualBookingModal() {
        this.showManualBookingModal.set(false);
        this.editingBookingId = null; // Reset editing state
        this.resetManualBookingForm();
    }

    resetManualBookingForm() {
        this.wasPickupPassed = false;
        this.isMaintenanceBooking.set(false);
        const v = this.selectedVehicle();
        const ins = this.selectedInstance();

        // Get wash price from the vehicle instance (vehicles table)
        let wash = 0;
        if (ins && ins.wash_price !== undefined && ins.wash_price !== null) {
            wash = Number(ins.wash_price);
        }

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Calculate initial base price considering special periods
        let initialPrice = 0;
        if (v) {
            // Default to base_price
            initialPrice = Number(v.base_price) || 0;

            // Check special_periods for today's date
            let specialPeriods: any[] = [];
            if (typeof v.special_periods === 'string') {
                try { specialPeriods = JSON.parse(v.special_periods); } catch (e) { }
            } else if (Array.isArray(v.special_periods)) {
                specialPeriods = v.special_periods;
            }

            // Find if today falls within any special period
            const matchingPeriod = specialPeriods.find((p: any) =>
                todayStr >= p.start && todayStr <= p.end
            );

            if (matchingPeriod && matchingPeriod.price) {
                initialPrice = Number(matchingPeriod.price);
            }
        }

        this.manualBookingForm = {
            fullName: '',
            email: '',
            phone: '',
            ddi: '+57',
            nationality: 'Colombia',
            docType: 'CC',
            docNumber: '',
            startDate: todayStr,
            endDate: tomorrowStr,
            pickupTime: '10:00',
            dropoffTime: '10:00',
            pickupLocation: 'Cartagena',
            dropoffLocation: 'Cartagena',
            totalPrice: 0,
            notes: '',
            pricePerDay: initialPrice,
            washFee: wash,
            additionalCosts: [],
            createdAt: null,
            notifyAdmin: false,
            notifyUser: false
        };
        this.breakdownData = { days: 0, baseTotal: 0, wash: wash, dropoff: 0 };
        // Recalculate total with proper dates
        this.calculateManualPrice('date');
    }

    selectManualDDI(country: Country) {
        this.manualBookingForm.ddi = country.dialCode;
        this.ddiSearch.set(country.dialCode);
        this.showManualDDI.set(false);
    }

    selectManualDocType(type: string) {
        this.manualBookingForm.docType = type;
        this.showManualDocType.set(false);
    }

    selectManualPickupCity(city: string) {
        this.manualBookingForm.pickupLocation = city;
        this.showManualPickupCity.set(false);
        this.calculateManualPrice();
    }

    selectManualDropoffCity(city: string) {
        this.manualBookingForm.dropoffLocation = city;
        this.showManualDropoffCity.set(false);
        this.calculateManualPrice();
    }

    // DDI Logic using Country Interface
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

    searchBookingDDI = signal('');
}