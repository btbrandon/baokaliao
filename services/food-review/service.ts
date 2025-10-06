import { prisma } from '@/lib/prisma';
import { FoodReview, CreateFoodReviewInput, Dish } from '@/types';
import { expenseService } from '@/services/expense/service';

const mapFoodReview = (review: any): FoodReview => ({
  id: review.id,
  user_id: review.userId,
  place_name: review.placeName,
  place_address: review.placeAddress,
  latitude: review.latitude ? review.latitude.toNumber() : undefined,
  longitude: review.longitude ? review.longitude.toNumber() : undefined,
  google_place_id: review.googlePlaceId,
  overall_rating: review.overallRating.toNumber(),
  notes: review.notes,
  visit_date: review.visitDate.toISOString().split('T')[0],
  created_at: review.createdAt.toISOString(),
  updated_at: review.updatedAt.toISOString(),
  dishes: review.dishes?.map(mapDish),
  ratings: review.ratings?.map((r: any) => ({
    id: r.id,
    review_id: r.reviewId,
    category: r.category,
    rating: r.rating.toNumber(),
  })),
  photos: review.photos?.map((p: any) => ({
    id: p.id,
    review_id: p.reviewId,
    url: p.url,
    caption: p.caption,
    created_at: p.createdAt.toISOString(),
  })),
});

const mapDish = (dish: any): Dish => ({
  id: dish.id,
  review_id: dish.reviewId,
  name: dish.name,
  price: dish.price.toNumber(),
  notes: dish.notes,
  rating: dish.rating ? dish.rating.toNumber() : undefined,
  expense_id: dish.expenseId,
  created_at: dish.createdAt.toISOString(),
});

export const foodReviewService = {
  async fetchReviews(userId: string): Promise<FoodReview[]> {
    const reviews = await prisma.foodReview.findMany({
      where: { userId },
      include: {
        dishes: true,
        ratings: true,
        photos: true,
      },
      orderBy: { visitDate: 'desc' },
    });

    return reviews.map(mapFoodReview);
  },

  async getReview(reviewId: string, userId: string): Promise<FoodReview | null> {
    const review = await prisma.foodReview.findFirst({
      where: { id: reviewId, userId },
      include: {
        dishes: true,
        ratings: true,
        photos: true,
      },
    });

    return review ? mapFoodReview(review) : null;
  },

  async createReview(userId: string, input: CreateFoodReviewInput): Promise<FoodReview> {
    const review = await prisma.$transaction(async (tx) => {
      const createdReview = await tx.foodReview.create({
        data: {
          userId,
          placeName: input.place_name,
          placeAddress: input.place_address,
          latitude: input.latitude,
          longitude: input.longitude,
          googlePlaceId: input.google_place_id,
          overallRating: input.overall_rating,
          notes: input.notes,
          visitDate: new Date(input.visit_date),
          dishes: {
            create: input.dishes.map((dish) => ({
              name: dish.name,
              price: dish.price,
              notes: dish.notes,
              rating: dish.rating,
            })),
          },
          ratings: {
            create: input.ratings.map((rating) => ({
              category: rating.category,
              rating: rating.rating,
            })),
          },
          photos: input.photos
            ? {
                create: input.photos.map((url) => ({
                  url,
                })),
              }
            : undefined,
        },
        include: {
          dishes: true,
          ratings: true,
          photos: true,
        },
      });

      // Check if any dish should create an expense (if at least one has create_expense = true)
      const shouldCreateExpense = input.dishes.some((dish) => dish.create_expense);

      if (shouldCreateExpense && input.bill_adjustments) {
        // Calculate the adjusted total per person
        const subtotal = input.dishes.reduce((sum, dish) => sum + dish.price, 0);
        let total = subtotal;

        if (input.bill_adjustments.apply_gst) {
          total *= 1.09; // Add 9% GST
        }
        if (input.bill_adjustments.apply_service_charge) {
          total *= 1.1; // Add 10% service charge
        }
        if (input.bill_adjustments.split_bill && input.bill_adjustments.number_of_people > 1) {
          total /= input.bill_adjustments.number_of_people;
        }

        // Create a single expense for the entire review
        const expense = await expenseService.createExpense({
          user_id: userId,
          amount: total,
          description: input.place_name,
          category: 'Food & Dining',
          date: input.visit_date,
          notes: `Food review expense${
            input.bill_adjustments.split_bill
              ? ` (split ${input.bill_adjustments.number_of_people} ways)`
              : ''
          }`,
          receipt_url: null,
          is_recurring: false,
          recurring_day: null,
        });

        // Link the expense to the first dish that has create_expense = true
        const firstDishWithExpense = input.dishes.findIndex((dish) => dish.create_expense);
        if (firstDishWithExpense !== -1) {
          await tx.dish.update({
            where: { id: createdReview.dishes[firstDishWithExpense].id },
            data: { expenseId: expense.id },
          });
          createdReview.dishes[firstDishWithExpense].expenseId = expense.id;
        }
      }

      return createdReview;
    });

    return mapFoodReview(review);
  },

  async updateReview(
    reviewId: string,
    userId: string,
    updates: Partial<CreateFoodReviewInput>
  ): Promise<FoodReview> {
    const data: any = {};
    if (updates.place_name !== undefined) data.placeName = updates.place_name;
    if (updates.place_address !== undefined) data.placeAddress = updates.place_address;
    if (updates.latitude !== undefined) data.latitude = updates.latitude;
    if (updates.longitude !== undefined) data.longitude = updates.longitude;
    if (updates.google_place_id !== undefined) data.googlePlaceId = updates.google_place_id;
    if (updates.overall_rating !== undefined) data.overallRating = updates.overall_rating;
    if (updates.notes !== undefined) data.notes = updates.notes;
    if (updates.visit_date !== undefined) data.visitDate = new Date(updates.visit_date);

    const updated = await prisma.foodReview.update({
      where: { id: reviewId },
      data,
      include: {
        dishes: true,
        ratings: true,
        photos: true,
      },
    });

    return mapFoodReview(updated);
  },

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    await prisma.foodReview.delete({
      where: { id: reviewId, userId },
    });
  },

  async addDish(
    reviewId: string,
    userId: string,
    dish: CreateFoodReviewInput['dishes'][0]
  ): Promise<Dish> {
    const review = await prisma.foodReview.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const createdDish = await prisma.dish.create({
      data: {
        reviewId,
        name: dish.name,
        price: dish.price,
        notes: dish.notes,
        rating: dish.rating,
      },
    });

    if (dish.create_expense) {
      const expense = await expenseService.createExpense({
        user_id: userId,
        amount: dish.price,
        description: `${review.placeName} - ${dish.name}`,
        category: 'Food & Dining',
        date: review.visitDate.toISOString().split('T')[0],
        notes: `From food review at ${review.placeName}`,
        receipt_url: null,
        is_recurring: false,
        recurring_day: null,
      });

      await prisma.dish.update({
        where: { id: createdDish.id },
        data: { expenseId: expense.id },
      });

      createdDish.expenseId = expense.id;
    }

    return mapDish(createdDish);
  },

  async addPhotos(reviewId: string, userId: string, photoUrls: string[]): Promise<void> {
    const review = await prisma.foodReview.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    await prisma.reviewPhoto.createMany({
      data: photoUrls.map((url) => ({
        reviewId,
        url,
      })),
    });
  },

  async deletePhoto(photoId: string, userId: string): Promise<void> {
    const photo = await prisma.reviewPhoto.findFirst({
      where: {
        id: photoId,
        review: {
          userId,
        },
      },
    });

    if (!photo) {
      throw new Error('Photo not found');
    }

    await prisma.reviewPhoto.delete({
      where: { id: photoId },
    });
  },
};
