export interface Review {
    reviewerName: string;
    starRating: number;
    reviewText: string;
    date: string; // ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
    avatarUrl?: string;
}

// Based on current reference time: 2025-12-27
// Based on current reference time: 2025-12-27
export const REVIEWS_ES: Review[] = [
    {
        reviewerName: "Juan Pablo Tovar Hernández",
        starRating: 5,
        reviewText: "Excelente experiencia con Ocean Drive. El proceso de entrega y devolución del vehículo fue muy rápido y sin complicaciones. El personal es muy amable y profesional. Sin duda, la mejor opción para alquilar un coche en Cartagena. ¡Totalmente recomendados!",
        date: "2025-12-27T19:02:00" // ~3 mins ago
    },
    {
        reviewerName: "Gabriela Gonzales hurtado",
        starRating: 5,
        reviewText: "Muy buenos!! Recomiendo mucho su servicio y su atención al cliente fue excelente durante todo el proceso 😃😃...",
        date: "2025-12-27T18:14:00" // ~51 mins ago
    },
    {
        reviewerName: "Sergio Esteban Niño Castellanos",
        starRating: 5,
        reviewText: "Excelente servicio, autos en muy buenas condiciones!!! Muy recomendados!! 🫡🫡🤗",
        date: "2025-12-27T18:12:00" // ~53 mins ago
    },
    {
        reviewerName: "Marco Antonio Manrique Acha",
        starRating: 5,
        reviewText: "Muy recomendados. Alquilé un carro por dos días, casi a ultimo momento. La asesora me brindo los precios y sugerencias, siempre muy comunicativa siempre por whatsapp. El servicio de atención al cliente fue muy bueno. Recomiendo alquilar aquí.",
        date: "2025-12-21T12:00:00" // ~6 days ago
    }
];

export const REVIEWS_EN: Review[] = [
    {
        reviewerName: "Juan Pablo Tovar Hernández",
        starRating: 5,
        reviewText: "Excellent experience with Ocean Drive. The car delivery and return process was very fast and uncomplicated. The staff is very friendly and professional. Undoubtedly, the best option to rent a car in Cartagena. Totally recommended!",
        date: "2025-12-27T19:02:00"
    },
    {
        reviewerName: "Gabriela Gonzales hurtado",
        starRating: 5,
        reviewText: "Very good!! I highly recommend their service and their customer attention was excellent during the whole process 😃😃...",
        date: "2025-12-27T18:14:00"
    },
    {
        reviewerName: "Sergio Esteban Niño Castellanos",
        starRating: 5,
        reviewText: "Excellent service, cars in very good conditions!!! Highly recommended!! 🫡🫡🤗",
        date: "2025-12-27T18:12:00"
    },
    {
        reviewerName: "Marco Antonio Manrique Acha",
        starRating: 5,
        reviewText: "Highly recommended. I rented a car for two days, almost last minute. The advisor gave me prices and suggestions, always very communicative via whatsapp. Customer service was very good. I recommend renting here.",
        date: "2025-12-21T12:00:00"
    }
];

export const REVIEWS = REVIEWS_ES;
