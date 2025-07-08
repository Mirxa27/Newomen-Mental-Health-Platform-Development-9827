import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data (optional, uncomment if needed)
  // await prisma.message.deleteMany({});
  // await prisma.conversation.deleteMany({});
  // await prisma.shadowWorkSession.deleteMany({});
  // await prisma.user.deleteMany({});

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@newomen.com' },
    update: {},
    create: {
      email: 'admin@newomen.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('👑 Created admin user:', adminUser.email);

  // Create test users
  const testUsers = [
    {
      email: 'sarah@example.com',
      name: 'Sarah Johnson',
      password: 'test123',
      role: 'user',
    },
    {
      email: 'mike@example.com',
      name: 'Mike Chen',
      password: 'test123',
      role: 'user',
    },
    {
      email: 'emma@example.com',
      name: 'Emma Williams',
      password: 'test123',
      role: 'user',
    },
  ];

  const createdUsers = [];
  
  for (const userData of testUsers) {
    const hashedUserPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedUserPassword,
        name: userData.name,
        role: userData.role,
      },
    });

    createdUsers.push(user);
    console.log('👤 Created user:', user.email);
  }

  // Create sample conversations for test users
  const sampleConversations = [
    {
      userId: createdUsers[0].id,
      title: 'First therapy session',
      messages: [
        { role: 'user', content: 'Hi, I\'m feeling anxious about starting therapy.' },
        { role: 'assistant', content: 'I understand that starting therapy can feel overwhelming. It\'s completely normal to feel anxious about this step. What specifically is making you feel anxious about it?' },
        { role: 'user', content: 'I\'m not sure if I\'ll be able to open up to someone I don\'t know.' },
        { role: 'assistant', content: 'That\'s a very common concern. Building trust takes time, and you can go at your own pace. Would you like to start with something small that you feel comfortable sharing?' },
      ],
    },
    {
      userId: createdUsers[1].id,
      title: 'Dealing with work stress',
      messages: [
        { role: 'user', content: 'I\'ve been having trouble sleeping because of work stress.' },
        { role: 'assistant', content: 'Work stress can definitely impact sleep quality. Can you tell me more about what specific aspects of work are causing you stress?' },
        { role: 'user', content: 'My manager keeps giving me impossible deadlines.' },
        { role: 'assistant', content: 'That sounds really challenging. Have you been able to have any conversations with your manager about workload and realistic timelines?' },
      ],
    },
    {
      userId: createdUsers[2].id,
      title: 'Relationship concerns',
      messages: [
        { role: 'user', content: 'I\'ve been having some issues with my partner lately.' },
        { role: 'assistant', content: 'Relationship challenges can be really difficult to navigate. What kind of issues have you been experiencing?' },
        { role: 'user', content: 'We seem to argue about everything lately.' },
        { role: 'assistant', content: 'Frequent arguments can be exhausting for both partners. Have you noticed any patterns in what triggers these arguments?' },
      ],
    },
  ];

  for (const convData of sampleConversations) {
    const conversation = await prisma.conversation.create({
      data: {
        title: convData.title,
        userId: convData.userId,
      },
    });

    for (const msgData of convData.messages) {
      await prisma.message.create({
        data: {
          content: msgData.content,
          role: msgData.role,
          conversationId: conversation.id,
        },
      });
    }

    console.log('💬 Created conversation:', conversation.title);
  }

  // Create sample shadow work sessions
  const sampleShadowWorkSessions = [
    {
      userId: createdUsers[0].id,
      questionId: '1',
      response: 'I try to hide my perfectionism from others because I\'m afraid they\'ll think I\'m too controlling or neurotic.',
      insights: 'Your perfectionism might be a way of feeling in control when other areas of life feel uncertain. Consider how this trait both serves and limits you.',
      completed: true,
    },
    {
      userId: createdUsers[0].id,
      questionId: '2',
      response: 'I find it really hard to express anger. I was taught that anger is bad and destructive.',
      insights: 'Anger is a natural emotion that can signal when boundaries are being crossed. Learning to express it healthily is important for your wellbeing.',
      completed: true,
    },
    {
      userId: createdUsers[1].id,
      questionId: '1',
      response: 'I hide my sensitivity because I don\'t want to appear weak, especially at work.',
      insights: 'Sensitivity can be a strength when channeled properly. It allows for deeper empathy and understanding of others.',
      completed: true,
    },
    {
      userId: createdUsers[2].id,
      questionId: '3',
      response: 'I get really irritated when people are late or disorganized. It makes me feel like they don\'t respect my time.',
      insights: 'This irritation might reflect your own relationship with time and organization. How do you feel when you\'re disorganized?',
      completed: true,
    },
  ];

  for (const sessionData of sampleShadowWorkSessions) {
    const session = await prisma.shadowWorkSession.create({
      data: sessionData,
    });

    console.log('🔍 Created shadow work session for user:', session.userId);
  }

  console.log('✅ Database seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`👑 Admin user: admin@newomen.com (password: admin123)`);
  console.log(`👥 Test users: ${testUsers.length} created (password: test123)`);
  console.log(`💬 Conversations: ${sampleConversations.length} created`);
  console.log(`🔍 Shadow work sessions: ${sampleShadowWorkSessions.length} created`);
  console.log('\n🚀 Ready to start development!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });