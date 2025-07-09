import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  try {
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@newomen.com' },
      update: {},
      create: {
        email: 'admin@newomen.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'admin',
      },
    });

    console.log('✅ Admin user created:', adminUser.email);
  } catch (error) {
    console.log('ℹ️ Admin user already exists or error:', error.message);
  }

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  
  try {
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@newomen.com' },
      update: {},
      create: {
        email: 'demo@newomen.com',
        name: 'Demo User',
        password: demoPassword,
        role: 'user',
      },
    });

    console.log('✅ Demo user created:', demoUser.email);

    // Create sample conversation for demo user
    const conversation = await prisma.conversation.create({
      data: {
        title: 'Welcome to Newomen',
        userId: demoUser.id,
      },
    });

    // Create sample messages
    await prisma.message.createMany({
      data: [
        {
          content: 'Hello, I\'m feeling a bit anxious today and could use some support.',
          role: 'user',
          conversationId: conversation.id,
        },
        {
          content: 'I understand that you\'re feeling anxious today. That takes courage to reach out. I\'m here to listen and support you. Can you tell me more about what\'s contributing to your anxiety right now?',
          role: 'assistant',
          conversationId: conversation.id,
        },
        {
          content: 'I have a big presentation at work tomorrow and I keep worrying about all the things that could go wrong.',
          role: 'user',
          conversationId: conversation.id,
        },
        {
          content: 'Work presentations can definitely trigger anxiety - it\'s completely normal to feel this way. It sounds like your mind is focusing on potential problems. Let\'s try a different approach: what are three things you\'re well-prepared for in this presentation?',
          role: 'assistant',
          conversationId: conversation.id,
        },
      ],
    });

    console.log('✅ Sample conversation created for demo user');

    // Create sample shadow work session
    await prisma.shadowWorkSession.create({
      data: {
        userId: demoUser.id,
        questionId: '1',
        response: 'I think I try to hide my vulnerability and the fact that I sometimes feel like I don\'t know what I\'m doing, especially at work.',
        insights: 'Your awareness of this pattern is the first step toward integration. Many people struggle with imposter syndrome - the feeling that we\'re not as competent as others perceive us to be. Consider that your vulnerability might actually be a strength that allows you to connect more authentically with others.',
        completed: true,
      },
    });

    console.log('✅ Sample shadow work session created for demo user');
  } catch (error) {
    console.log('ℹ️ Demo user already exists or error:', error.message);
  }

  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });