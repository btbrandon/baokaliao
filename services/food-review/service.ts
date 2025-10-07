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
  expense_id: review.expenseId,
  bill_adjustments: review.billAdjustments,
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
    user_id: p.userId,
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
      let expenseId: string | undefined;

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

        expenseId = expense.id;
      }

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
          ...(expenseId && { expenseId }),
          ...(input.bill_adjustments && { billAdjustments: input.bill_adjustments }),
          dishes: {
            create: input.dishes.map((dish) => ({
              name: dish.name,
              price: dish.price,
              notes: dish.notes,
              rating: dish.rating,
              expenseId: dish.create_expense ? expenseId : undefined,
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
                  userId,
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

      return createdReview;
    });

    return mapFoodReview(review);
  },

  async updateReview(
    reviewId: string,
    userId: string,
    updates: Partial<CreateFoodReviewInput>
  ): Promise<FoodReview> {
    const review = await prisma.$transaction(async (tx) => {
      // Get current review
      // Get current review with all fields including expenseId and billAdjustments
      const currentReview = (await tx.foodReview.findFirst({
        where: { id: reviewId, userId },
        include: { dishes: true },
      })) as any; // Type assertion needed as Prisma client may not fully recognize new fields yet

      if (!currentReview) {
        throw new Error('Review not found');
      }

      // Prepare basic update data
      const data: any = {};
      if (updates.place_name !== undefined) data.placeName = updates.place_name;
      if (updates.place_address !== undefined) data.placeAddress = updates.place_address;
      if (updates.latitude !== undefined) data.latitude = updates.latitude;
      if (updates.longitude !== undefined) data.longitude = updates.longitude;
      if (updates.google_place_id !== undefined) data.googlePlaceId = updates.google_place_id;
      if (updates.overall_rating !== undefined) data.overallRating = updates.overall_rating;
      if (updates.notes !== undefined) data.notes = updates.notes;
      if (updates.visit_date !== undefined) data.visitDate = new Date(updates.visit_date);
      if (updates.bill_adjustments !== undefined) data.billAdjustments = updates.bill_adjustments;

      // Handle expense updates
      if (updates.dishes !== undefined && updates.bill_adjustments !== undefined) {
        const shouldCreateExpense = updates.dishes.some((dish) => dish.create_expense);

        if (shouldCreateExpense) {
          const subtotal = updates.dishes.reduce((sum, dish) => sum + dish.price, 0);
          let total = subtotal;

          if (updates.bill_adjustments.apply_gst) {
            total *= 1.09;
          }
          if (updates.bill_adjustments.apply_service_charge) {
            total *= 1.1;
          }
          if (
            updates.bill_adjustments.split_bill &&
            updates.bill_adjustments.number_of_people > 1
          ) {
            total /= updates.bill_adjustments.number_of_people;
          }

          if (currentReview.expenseId) {
            // Update existing expense
            await expenseService.updateExpense(currentReview.expenseId, {
              amount: total,
              description: updates.place_name || currentReview.placeName,
              date: updates.visit_date || currentReview.visitDate.toISOString().split('T')[0],
              notes: `Food review expense${
                updates.bill_adjustments.split_bill
                  ? ` (split ${updates.bill_adjustments.number_of_people} ways)`
                  : ''
              }`,
            });
            data.expenseId = currentReview.expenseId;
          } else {
            // Create new expense
            const expense = await expenseService.createExpense({
              user_id: userId,
              amount: total,
              description: updates.place_name || currentReview.placeName,
              category: 'Food & Dining',
              date: updates.visit_date || currentReview.visitDate.toISOString().split('T')[0],
              notes: `Food review expense${
                updates.bill_adjustments.split_bill
                  ? ` (split ${updates.bill_adjustments.number_of_people} ways)`
                  : ''
              }`,
              receipt_url: null,
              is_recurring: false,
              recurring_day: null,
            });
            data.expenseId = expense.id;
          }
        } else if (currentReview.expenseId) {
          // Delete expense if no longer needed
          await expenseService.deleteExpense(currentReview.expenseId);
          data.expenseId = null;
        }
      }

      // Update dishes if provided
      if (updates.dishes) {
        // Delete existing dishes
        await tx.dish.deleteMany({ where: { reviewId } });

        // Create new dishes
        await tx.dish.createMany({
          data: updates.dishes.map((dish) => ({
            reviewId,
            name: dish.name,
            price: dish.price,
            notes: dish.notes,
            rating: dish.rating,
            expenseId: dish.create_expense ? data.expenseId : undefined,
          })),
        });
      }

      // Update ratings if provided
      if (updates.ratings) {
        await tx.reviewRating.deleteMany({ where: { reviewId } });
        await tx.reviewRating.createMany({
          data: updates.ratings.map((rating) => ({
            reviewId,
            category: rating.category,
            rating: rating.rating,
          })),
        });
      }

      // Update photos if provided
      if (updates.photos) {
        await tx.reviewPhoto.deleteMany({ where: { reviewId } });
        await tx.reviewPhoto.createMany({
          data: updates.photos.map((url) => ({
            reviewId,
            userId,
            url,
          })),
        });
      }

      // Update the review
      const updatedReview = await tx.foodReview.update({
        where: { id: reviewId },
        data,
        include: {
          dishes: true,
          ratings: true,
          photos: true,
        },
      });

      return updatedReview;
    });

    return mapFoodReview(review);
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
