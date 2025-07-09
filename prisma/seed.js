import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create subscription plans
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Basic' },
    update: {},
    create: {
      name: 'Basic',
      description: 'Essential mental health support with AI companion',
      price: 9.99,
      currency: 'usd',
      features: [
        'AI Companion Chat',
        'Basic Shadow Work Exercises',
        'Mood Tracking',
        'Crisis Support',
        'Mobile App Access'
      ],
      maxMessages: 100,
      maxVoiceTime: 60, // 60 minutes
      isActive: true,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      description: 'Advanced mental health support with unlimited features',
      price: 19.99,
      currency: 'usd',
      features: [
        'Unlimited AI Companion Chat',
        'Advanced Shadow Work Program',
        'Voice Chat Sessions',
        'Breathing Exercises',
        'Personality Insights',
        'Progress Analytics',
        'Priority Crisis Support',
        'Mobile App Access'
      ],
      maxMessages: 500,
      maxVoiceTime: 300, // 300 minutes
      isActive: true,
    },
  });

  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      description: 'Complete mental wellness platform with all features',
      price: 29.99,
      currency: 'usd',
      features: [
        'Unlimited AI Companion Chat',
        'Complete Shadow Work Program',
        'Unlimited Voice Chat',
        'Advanced Breathing Practices',
        'Comprehensive Personality Tests',
        'Advanced Analytics & Insights',
        'Priority Crisis Support',
        'Human Counselor Access',
        'Custom AI Personality',
        'Mobile App Access',
        'Export Data & Reports'
      ],
      maxMessages: null, // Unlimited
      maxVoiceTime: null, // Unlimited
      isActive: true,
    },
  });

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { key: 'crisis_keywords' },
    update: {},
    create: {
      key: 'crisis_keywords',
      value: [
        'kill myself',
        'end my life',
        'suicide',
        'suicidal',
        'want to die',
        'better off dead',
        'end it all',
        'take my life',
        'cut myself',
        'hurt myself',
        'self harm',
        'self-harm',
        'cutting',
        'burn myself',
        'harm myself',
        'can\'t go on',
        'give up',
        'hopeless',
        'worthless',
        'useless',
        'nobody cares',
        'hate myself',
        'want to disappear'
      ],
      description: 'Keywords that trigger crisis alerts',
      category: 'crisis',
      isPublic: false,
    },
  });

  await prisma.systemSettings.upsert({
    where: { key: 'crisis_resources' },
    update: {},
    create: {
      key: 'crisis_resources',
      value: {
        'US': {
          'name': 'Suicide & Crisis Lifeline',
          'phone': '988',
          'text': 'Text HOME to 741741',
          'website': 'https://suicidepreventionlifeline.org'
        },
        'UK': {
          'name': 'Samaritans',
          'phone': '116 123',
          'website': 'https://www.samaritans.org'
        },
        'CA': {
          'name': 'Talk Suicide Canada',
          'phone': '1-833-456-4566',
          'website': 'https://talksuicide.ca'
        },
        'AU': {
          'name': 'Lifeline',
          'phone': '13 11 14',
          'website': 'https://www.lifeline.org.au'
        }
      },
      description: 'Crisis support resources by country',
      category: 'crisis',
      isPublic: true,
    },
  });

  await prisma.systemSettings.upsert({
    where: { key: 'app_version' },
    update: {},
    create: {
      key: 'app_version',
      value: '1.0.0',
      description: 'Current application version',
      category: 'general',
      isPublic: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Created plans:', { basicPlan, proPlan, premiumPlan });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });