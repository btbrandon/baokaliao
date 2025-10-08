import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPhotos() {
  try {
    // Get all food reviews with their photos
    const reviews = await prisma.foodReview.findMany({
      include: {
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    console.log('\n=== Recent Food Reviews and Photos ===\n');

    for (const review of reviews) {
      console.log(`Review: ${review.placeName}`);
      console.log(`ID: ${review.id}`);
      console.log(`Created: ${review.createdAt}`);
      console.log(`Photos count: ${review.photos.length}`);

      if (review.photos.length > 0) {
        console.log('Photos:');
        review.photos.forEach((photo, idx) => {
          console.log(`  ${idx + 1}. ${photo.url}`);
          console.log(`     User ID: ${(photo as any).userId || 'N/A'}`);
          console.log(`     Created: ${photo.createdAt}`);
        });
      } else {
        console.log('No photos attached');
      }
      console.log('---');
    }

    // Check total photos count
    const totalPhotos = await prisma.reviewPhoto.count();
    console.log(`\nTotal photos in database: ${totalPhotos}`);
  } catch (error) {
    console.error('Error checking photos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPhotos();
