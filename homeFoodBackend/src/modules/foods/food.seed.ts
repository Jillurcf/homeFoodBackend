import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { env } from "../../config/env";
import Food from "./food.model";
import Review from "../reviews/review.model";
import User from "../../model/user/user.model";

const DEMO_SELLER = {
  name: "Demo Food Maker",
  username: "demo_seller",
  email: "seller@homefood.test",
  password: "seller123",
  phone: "01712345678",
  address: "Dhanmondi, Dhaka",
  avatarUrl:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=75&auto=format&fit=crop",
  isVerified: true,
  role: "seller" as const,
};

const foods = [
  {
    name: "Kacchi Biryani (Mutton)",
    description:
      "Aromatic basmati rice layered with tender marinated mutton, fried onions, and signature kacchi spices. Slow-cooked in a sealed pot.",
    price: 350,
    category: "Biryani & Rice",
    perUnit: "1 plate",
    prepTime: 45,
    maxOrdersPerDay: 30,
    availability: "available" as const,
    imageUrl: "/images/PyramidRice.jpg",
    dietaryTags: ["halal", "spicy"],
    area: "Dhanmondi",
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: "Chicken Tehari",
    description:
      "Fragrant short-grate rice stir-fried with marinated chicken, mustard oil, and whole spices — a Dhaka street classic.",
    price: 200,
    category: "Biryani & Rice",
    perUnit: "1 plate",
    prepTime: 30,
    maxOrdersPerDay: 40,
    availability: "available" as const,
    imageUrl: "/images/friedRice.jpg",
    dietaryTags: ["halal"],
    area: "Mirpur",
    rating: 4.5,
    reviewCount: 89,
  },
  {
    name: "Ilish Bhapa (Steamed Hilsha)",
    description:
      "Premium Hilsha fish steamed in mustard paste, green chilli, and coconut oil — a Bengali delicacy.",
    price: 450,
    category: "Fish",
    perUnit: "1 piece (500g)",
    prepTime: 40,
    maxOrdersPerDay: 15,
    availability: "low" as const,
    imageUrl: "/images/HilishaFish.jpg",
    dietaryTags: ["halal", "spicy"],
    area: "Uttara",
    rating: 4.9,
    reviewCount: 56,
  },
  {
    name: "Rui Fish Curry with Rice",
    description:
      "Home-style Rui fish curry cooked with mustard oil, turmeric, and green chillies, served with steamed rice.",
    price: 180,
    category: "Fish",
    perUnit: "1 plate",
    prepTime: 25,
    maxOrdersPerDay: 25,
    availability: "available" as const,
    imageUrl: "/images/fishAndRice.jpg",
    dietaryTags: ["halal"],
    area: "Mohammadpur",
    rating: 4.3,
    reviewCount: 42,
  },
  {
    name: "Khichuri (Bhog Style)",
    description:
      "Comforting moong dal khichuri with seasonal vegetables, ghee, and a side of beguni. Pure vegetarian.",
    price: 150,
    category: "Khichuri",
    perUnit: "1 plate",
    prepTime: 20,
    maxOrdersPerDay: 35,
    availability: "available" as const,
    imageUrl: "/images/food.jpg",
    dietaryTags: ["vegetarian"],
    area: "Banani",
    rating: 4.6,
    reviewCount: 78,
  },
  {
    name: "Beef Rezala",
    description:
      "Slow-cooked beef in a rich yoghurt and cashew gravy with aromatic whole spices. Mildly spicy and creamy.",
    price: 320,
    category: "Curry",
    perUnit: "1 plate",
    prepTime: 50,
    maxOrdersPerDay: 20,
    availability: "available" as const,
    imageUrl: "/images/VartaVaat.jpg",
    dietaryTags: ["halal", "spicy"],
    area: "Mohakhali",
    rating: 4.7,
    reviewCount: 63,
  },
  {
    name: "Chicken Fried Rice",
    description:
      "Wok-fried rice with shredded chicken, eggs, spring onion, and house sauces. A Bangladeshi-Chinese favourite.",
    price: 220,
    category: "Chinese",
    perUnit: "1 plate",
    prepTime: 20,
    maxOrdersPerDay: 45,
    availability: "available" as const,
    imageUrl: "/images/friedRice1.jpg",
    dietaryTags: ["halal"],
    area: "Gulshan",
    rating: 4.4,
    reviewCount: 91,
  },
  {
    name: "Morog Polao",
    description:
      "Fragrant polao rice with slow-cooked chicken, ghee, and whole garam masala. Served with borhani.",
    price: 280,
    category: "Polao",
    perUnit: "1 plate",
    prepTime: 35,
    maxOrdersPerDay: 25,
    availability: "available" as const,
    imageUrl: "/images/PyramidRice.jpg",
    dietaryTags: ["halal"],
    area: "Dhanmondi",
    rating: 4.6,
    reviewCount: 55,
  },
  {
    name: "Chingri Malai Curry",
    description:
      "Juicy prawns simmered in a creamy coconut milk curry with subtle spices. A royal Bengali classic.",
    price: 380,
    category: "Curry",
    perUnit: "1 plate",
    prepTime: 35,
    maxOrdersPerDay: 18,
    availability: "low" as const,
    imageUrl: "/images/HilishaFish.jpg",
    dietaryTags: ["halal"],
    area: "Uttara",
    rating: 4.8,
    reviewCount: 47,
  },
  {
    name: "Bhuna Khichuri with Beef",
    description:
      "Rich bhuna-style khichuri topped with slow-braised beef bhuna, caramelised onions, and boiled egg.",
    price: 250,
    category: "Khichuri",
    perUnit: "1 plate",
    prepTime: 40,
    maxOrdersPerDay: 22,
    availability: "available" as const,
    imageUrl: "/images/food.jpg",
    dietaryTags: ["halal", "spicy"],
    area: "Mirpur",
    rating: 4.5,
    reviewCount: 68,
  },
  {
    name: "Chicken Roast with Fried Rice",
    description:
      "Soft chicken roast in sweet-savoury gravy served over a bed of house-style fried rice.",
    price: 260,
    category: "Chinese",
    perUnit: "1 plate",
    prepTime: 30,
    maxOrdersPerDay: 30,
    availability: "available" as const,
    imageUrl: "/images/VartaVaat.jpg",
    dietaryTags: ["halal"],
    area: "Banani",
    rating: 4.2,
    reviewCount: 34,
  },
  {
    name: "Katla Fish Curry",
    description:
      "Traditional Katla fish curry with potato wedges, mustard oil, and panch phoron — pure Bengali homestyle.",
    price: 200,
    category: "Fish",
    perUnit: "1 plate",
    prepTime: 30,
    maxOrdersPerDay: 20,
    availability: "sold_out" as const,
    imageUrl: "/images/fishAndRice.jpg",
    dietaryTags: ["halal"],
    area: "Mohammadpur",
    rating: 4.1,
    reviewCount: 29,
  },
];

const ensureSeller = async () => {
  const existing = await User.findOne({ email: DEMO_SELLER.email });
  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      { $set: { avatarUrl: DEMO_SELLER.avatarUrl, isVerified: true } }
    );
    return existing._id;
  }

  const hashed = await bcrypt.hash(DEMO_SELLER.password, env.BCRYPT_SALT_ROUNDS);
  const seller = await User.create({ ...DEMO_SELLER, password: hashed });
  console.log(`Created demo seller: ${DEMO_SELLER.email} / ${DEMO_SELLER.password}`);
  return seller._id;
};

// Delivery fee per dish, index-aligned with the `foods` array above.
const deliveryFees = [40, 40, 60, 45, 35, 55, 40, 45, 60, 40, 40, 50, 45];

const REVIEWS = [
  {
    author: "Fatema Karim",
    area: "Uttara",
    rating: 5,
    text: "Tasted just like my mother's cooking — fragrant, fresh and packed with care. Will order again.",
  },
  {
    author: "Tanvir Hossain",
    area: "Dhanmondi",
    rating: 5,
    text: "Arrived hot and on time. Generous portion for the price, and the packaging was spotless.",
  },
  {
    author: "Sadia Mehzabin",
    area: "Mirpur",
    rating: 4,
    text: "Great flavour and a generous serving. Would love a little more of the protein next time.",
  },
  {
    author: "Mahmudul Hasan",
    area: "Mohakhali",
    rating: 5,
    text: "Proper homestyle taste, not restaurant-style oily. My family finished everything.",
  },
  {
    author: "Sharmin Sultana",
    area: "Banani",
    rating: 4,
    text: "Rich flavour, delivered warm in neat packaging. The only note is that it arrived a bit late.",
  },
  {
    author: "Arif Chowdhury",
    area: "Gulshan",
    rating: 5,
    text: "Clean, tasty and quick. Flavourful without being greasy — exactly what I wanted from a home chef.",
  },
  {
    author: "Nusrat Jahan",
    area: "Mohammadpur",
    rating: 4,
    text: "Fresh and light, perfect with rice. The portions are honest and the spice level was just right.",
  },
  {
    author: "Imran Kabir",
    area: "Uttara",
    rating: 5,
    text: "Ordered for guests and everyone asked where it was from. Beautifully balanced spices.",
  },
  {
    author: "Rumana Haque",
    area: "Dhanmondi",
    rating: 5,
    text: "You can tell it is cooked fresh the same day. Aromatic, hearty and very comforting.",
  },
  {
    author: "Shakil Ahmed",
    area: "Mirpur",
    rating: 4,
    text: "Good value and tasty food. Will keep this on my weekday lunch rotation.",
  },
  {
    author: "Tasnim Rahman",
    area: "Banani",
    rating: 5,
    text: "The seller communicated nicely and the food matched the photos exactly. Very happy.",
  },
  {
    author: "Jahid Hasan",
    area: "Gulshan",
    rating: 4,
    text: "Comforting home food, delivered warm. Slightly under-salted for me but easily adjusted.",
  },
];

const REVIEWS_PER_FOOD = 3;

const buildReviews = (foodIds: mongoose.Types.ObjectId[]) =>
  foodIds.flatMap((foodId, foodIndex) =>
    Array.from({ length: REVIEWS_PER_FOOD }, (_, k) => {
      const review = REVIEWS[(foodIndex * REVIEWS_PER_FOOD + k) % REVIEWS.length];
      return {
        foodId,
        authorName: review.author,
        area: review.area,
        rating: review.rating,
        text: review.text,
        createdAt: new Date(
          Date.now() - ((k + 1) * 5 + foodIndex) * 24 * 60 * 60 * 1000
        ),
      };
    })
  );

const seed = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB");

  try {
    const sellerId = await ensureSeller();

    await Food.deleteMany({ sellerId });
    const inserted = await Food.insertMany(
      foods.map((f, index) => ({
        ...f,
        sellerId,
        deliveryFee: deliveryFees[index] ?? 40,
      }))
    );

    console.log(`Seeded ${inserted.length} foods for seller ${sellerId}`);

    const reviewDocs = buildReviews(inserted.map((food) => food._id));
    await Review.deleteMany({ foodId: { $in: inserted.map((f) => f._id) } });
    await Review.insertMany(reviewDocs);
    console.log(`Seeded ${reviewDocs.length} reviews`);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
