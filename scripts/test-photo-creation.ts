import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPhotoCreation() {
  try {
    console.log('Testing photo creation flow...\n');

    // Get a recent review
    const review = await prisma.foodReview.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { photos: true },
    });

    if (!review) {
      console.log('No reviews found');
      return;
    }

    console.log(`Review: ${review.placeName}`);
    console.log(`Review ID: ${review.id}`);
    console.log(`User ID: ${review.userId}`);
    console.log(`Photos in DB: ${review.photos.length}`);

    if (review.photos.length > 0) {
      console.log('\nExisting photos:');
      review.photos.forEach((photo, idx) => {
        console.log(`  ${idx + 1}. URL: ${photo.url}`);
        console.log(`     Review ID: ${photo.reviewId}`);
        console.log(`     User ID: ${(photo as any).userId || 'MISSING'}`);
      });
    }

    // Try to create a test photo
    console.log('\n\nAttempting to create test photo...');
    const testPhoto = await prisma.reviewPhoto.create({
      data: {
        reviewId: review.id,
        userId: review.userId,
        url: 'https://test.com/test-photo.jpg',
      } as any,
    });

    console.log('✅ Test photo created successfully!');
    console.log(`Photo ID: ${testPhoto.id}`);
    console.log(`Review ID: ${testPhoto.reviewId}`);
    console.log(`User ID: ${(testPhoto as any).userId || 'N/A'}`);

    // Clean up test photo
    await prisma.reviewPhoto.delete({ where: { id: testPhoto.id } });
    console.log('✅ Test photo cleaned up');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPhotoCreation();
