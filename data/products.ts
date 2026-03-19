export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  short: string;
  description: string;
  image?: string;
  images?: string[];
  inStock?: boolean;
  category: "wallet" | "bag" | "backpack" | "accessory";
  material?: string;
  dimensions?: string;
  capacity?: string;
  colors?: string[];
  tags?: string[];
  badge?: "hit" | "new";
  featured?: boolean;
  reviews?: Review[];
};

export const PRODUCTS: Product[] = [
  {
    id: "shopper",
    title: "Гаманець Mario Dion",
    price: 899,
    short: "Класичний гаманець із натуральної шкіри.",
    description:
      "Елегантний гаманець Mario Dion із натуральної телячої шкіри. Класичний складаний дизайн, 8 відділень для карток, відсік для купюр та монет. Металева фурнітура золотистого кольору, прошивка вощеною ниткою.",
    image: "/products/shopper.jpg",
    images: ["/products/shopper.jpg"],
    inStock: true,
    category: "wallet",
    material: "Натуральна теляча шкіра",
    dimensions: "11 × 9 × 2 см",
    capacity: "8 карток, відсік для купюр, монетник",
    colors: ["Чорний", "Коричневий", "Бордовий"],
    tags: ["новинка", "хіт"],
    featured: true,
    reviews: [
      { author: "Марина К.", rating: 5, text: "Чудова якість шкіри, дуже задоволена! Доставили швидко.", date: "2025-03-01" },
      { author: "Олексій Т.", rating: 5, text: "Взяв в подарунок — отримувач в захваті. Виглядає дорого.", date: "2025-02-15" },
      { author: "Ірина С.", rating: 4, text: "Якісна річ, шкіра справжня. Монетник трохи маленький.", date: "2025-01-28" },
    ],
  },
  {
    id: "backpack",
    title: "Сумка дорожня",
    price: 1299,
    short: "Містка дорожня сумка для поїздок і перельотів.",
    description:
      "Просторна дорожня сумка з міцної поліестерної тканини з водовідштовхувальним покриттям. Два великі відділення, кишеня для ноутбука до 15.6\", бічні кишені на блискавках. Зручні ручки та знімний плечовий ремінь.",
    image: "/products/backpack.jpg",
    images: ["/products/backpack.jpg"],
    inStock: true,
    category: "bag",
    material: "Поліестер 600D, металева фурнітура",
    dimensions: "48 × 30 × 22 см",
    capacity: "35 л, відсік для ноутбука 15.6\"",
    colors: ["Чорний", "Хакі", "Темно-синій"],
    tags: ["хіт"],
    featured: true,
    reviews: [
      { author: "Василь П.", rating: 5, text: "Брав для відрядження — вміщує все необхідне. Міцна, зручна.", date: "2025-02-20" },
      { author: "Наталія Г.", rating: 4, text: "Відмінна сумка, якість на рівні. Трохи важка без речей.", date: "2025-01-10" },
    ],
  },
  {
    id: "crossbody",
    title: "Сумка кросбоді Elegance",
    price: 1150,
    oldPrice: 1400,
    short: "Стильна сумка через плече на кожен день.",
    description:
      "Компактна сумка-кросбоді зі штучної шкіри преміум-класу. Основне відділення на блискавці, фронтальна кишеня, регульований плечовий ремінь 80–130 см. Металева застібка-магніт. Підходить під повсякденний та вечірній образ.",
    image: "/products/crossbody.jpg",
    images: ["/products/crossbody.jpg"],
    inStock: true,
    category: "bag",
    material: "Штучна шкіра PU, тканинна підкладка",
    dimensions: "23 × 16 × 7 см",
    capacity: "Телефон, гаманець, ключі, косметичка",
    colors: ["Бежевий", "Чорний", "Рожевий", "Зелений"],
    tags: ["акція", "хіт"],
    featured: true,
    reviews: [
      { author: "Оксана М.", rating: 5, text: "Дуже гарна сумочка! Якість краща ніж очікувала за цю ціну.", date: "2025-03-05" },
    ],
  },
  {
    id: "tote",
    title: "Шопер Canvas Premium",
    price: 650,
    short: "Великий екосвідомий шопер із щільного канвасу.",
    description:
      "Вмістистий шопер з товстого канвасу (450 г/м²). Підсилені ручки, внутрішня кишеня на блискавці. Витримує навантаження до 15 кг. Можна прати при 30°C. Ідеальний для покупок, пляжу та роботи.",
    image: "/products/tote.jpg",
    images: ["/products/tote.jpg"],
    inStock: true,
    category: "bag",
    material: "Канвас 450 г/м², бавовна 100%",
    dimensions: "42 × 38 × 12 см",
    capacity: "До 15 кг, 1 внутрішня кишеня на блискавці",
    colors: ["Натуральний", "Чорний", "Оливковий"],
    tags: ["еко", "новинка"],
    featured: false,
    reviews: [],
  },
  {
    id: "citybackpack",
    title: "Рюкзак міський Urban",
    price: 1599,
    short: "Ергономічний міський рюкзак із USB-портом.",
    description:
      "Сучасний міський рюкзак з антикрадій-кишенею на спині, USB-портом для зарядки та відсіком для ноутбука 17\". М'яка підкладка для спини, регульовані лямки з накладками. Водостійке покриття.",
    image: "/products/citybackpack.jpg",
    images: ["/products/citybackpack.jpg"],
    inStock: true,
    category: "backpack",
    material: "Нейлон 1680D, алюмінієва фурнітура",
    dimensions: "46 × 32 × 18 см",
    capacity: "28 л, ноутбук до 17\", вбудований USB-порт",
    colors: ["Чорний", "Сірий"],
    tags: ["новинка", "tech"],
    featured: true,
    reviews: [
      { author: "Дмитро К.", rating: 5, text: "USB-порт — дуже зручно! Рюкзак вмісткий і якісний.", date: "2025-03-10" },
      { author: "Людмила Ф.", rating: 5, text: "Купила для доньки-студентки. Вона в захваті, вміщує всі книжки.", date: "2025-02-28" },
    ],
  },
  {
    id: "cardholder",
    title: "Картхолдер Slim Leather",
    price: 450,
    short: "Мінімалістичний тримач для карток зі шкіри.",
    description:
      "Ультратонкий картхолдер з натуральної зернистої шкіри. Вміщує 4–6 карток. Не додає зайвого об'єму в кишені. Металева застібка-кліп. Ідеальний подарунок.",
    image: "/products/cardholder.jpg",
    images: ["/products/cardholder.jpg"],
    inStock: true,
    category: "accessory",
    material: "Натуральна зерниста шкіра",
    dimensions: "9.5 × 6.5 × 0.5 см",
    capacity: "4–6 карток",
    colors: ["Чорний", "Коричневий", "Темно-зелений"],
    tags: ["мінімалізм", "подарунок"],
    featured: false,
    reviews: [
      { author: "Андрій В.", rating: 5, text: "Подарував колезі — дуже сподобалось. Якісна річ.", date: "2025-01-20" },
    ],
  },
];

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export const CATEGORIES = [
  { id: "all", label: "Усі товари" },
  { id: "bag", label: "Сумки" },
  { id: "backpack", label: "Рюкзаки" },
  { id: "wallet", label: "Гаманці" },
  { id: "accessory", label: "Аксесуари" },
] as const;
