import { PrismaClient, UserRole, HealthRecordType, PlanStatus, InterviewType, NotificationType, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータの作成を開始します...');

  // 管理者ユーザーの作成
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@talent-management.com' },
    update: {},
    create: {
      email: 'admin@talent-management.com',
      password: adminPassword,
      name: 'システム管理者',
      role: UserRole.ADMIN,
      department: '人事部'
    }
  });

  // 部署ユーザーの作成
  const departmentPassword = await bcrypt.hash('dept123', 12);
  const departmentUser = await prisma.user.upsert({
    where: { email: 'dept@talent-management.com' },
    update: {},
    create: {
      email: 'dept@talent-management.com',
      password: departmentPassword,
      name: '現場担当者',
      role: UserRole.DEPARTMENT,
      department: '製造部'
    }
  });

  console.log('✅ ユーザーを作成しました');

  // スキルマスターの作成
  const skillMasters = [
    {
      name: '日本語能力',
      category: '言語',
      description: '日本語の読み書き、会話能力',
      levels: {
        1: '基本的な挨拶ができる',
        2: '簡単な日常会話ができる',
        3: '業務に関する会話ができる',
        4: '複雑な業務内容を理解できる',
        5: 'ネイティブレベルでコミュニケーションができる'
      }
    },
    {
      name: '機械操作',
      category: '技術',
      description: '製造機械の操作技術',
      levels: {
        1: '基本的な操作ができる',
        2: '標準的な作業ができる',
        3: '複雑な操作ができる',
        4: '機械の調整・メンテナンスができる',
        5: '新しい機械の習得・指導ができる'
      }
    },
    {
      name: '品質管理',
      category: '品質',
      description: '品質チェック・管理技術',
      levels: {
        1: '基本的な品質チェックができる',
        2: '標準的な品質基準を理解している',
        3: '品質問題の識別ができる',
        4: '品質改善提案ができる',
        5: '品質管理システムの構築ができる'
      }
    },
    {
      name: '安全作業',
      category: '安全',
      description: '安全作業の知識と実践',
      levels: {
        1: '基本的な安全ルールを理解している',
        2: '安全装備の正しい使用ができる',
        3: '危険予知ができる',
        4: '安全指導ができる',
        5: '安全管理システムの構築ができる'
      }
    },
    {
      name: 'チームワーク',
      category: 'ソフトスキル',
      description: 'チームでの協働能力',
      levels: {
        1: '指示に従って作業ができる',
        2: 'チームメンバーと協力できる',
        3: '積極的にチームに貢献できる',
        4: 'チームのリーダーシップを発揮できる',
        5: 'チーム全体の能力向上に貢献できる'
      }
    }
  ];

  for (const skill of skillMasters) {
    await prisma.skillMaster.upsert({
      where: { name: skill.name },
      update: {},
      create: skill
    });
  }

  console.log('✅ スキルマスターを作成しました');

  // 実習生のサンプルデータ作成
  const trainees = [
    {
      traineeId: 'T2024001',
      firstName: '太郎',
      lastName: 'グエン',
      firstNameKana: 'タロウ',
      lastNameKana: 'グエン',
      nationality: 'ベトナム',
      passportNumber: 'N1234567',
      visaType: '技能実習1号',
      visaExpiryDate: new Date('2025-12-31'),
      entryDate: new Date('2024-01-15'),
      department: '製造部',
      position: '技能実習生',
      phoneNumber: '090-1234-5678',
      email: 'trainee1@example.com',
      address: '東京都渋谷区',
      emergencyContact: 'グエン 花子',
      emergencyPhone: '090-9876-5432'
    },
    {
      traineeId: 'T2024002',
      firstName: '花子',
      lastName: 'チャン',
      firstNameKana: 'ハナコ',
      lastNameKana: 'チャン',
      nationality: 'ベトナム',
      passportNumber: 'N2345678',
      visaType: '技能実習2号',
      visaExpiryDate: new Date('2026-06-30'),
      entryDate: new Date('2023-07-01'),
      department: '製造部',
      position: '技能実習生',
      phoneNumber: '090-2345-6789',
      email: 'trainee2@example.com',
      address: '東京都新宿区',
      emergencyContact: 'チャン 太郎',
      emergencyPhone: '090-8765-4321'
    },
    {
      traineeId: 'T2024003',
      firstName: '明',
      lastName: 'リー',
      firstNameKana: 'アキラ',
      lastNameKana: 'リー',
      nationality: '中国',
      passportNumber: 'C3456789',
      visaType: '技能実習1号',
      visaExpiryDate: new Date('2025-03-15'),
      entryDate: new Date('2024-03-01'),
      department: '品質管理部',
      position: '技能実習生',
      phoneNumber: '090-3456-7890',
      email: 'trainee3@example.com',
      address: '東京都品川区',
      emergencyContact: 'リー 美香',
      emergencyPhone: '090-7654-3210'
    }
  ];

  for (const traineeData of trainees) {
    await prisma.trainee.upsert({
      where: { traineeId: traineeData.traineeId },
      update: {},
      create: traineeData
    });
  }

  console.log('✅ 実習生サンプルデータを作成しました');

  // システム設定の初期値
  const systemSettings = [
    {
      key: 'visa_expiry_alert_days',
      value: '60',
      description: '在留期限アラートの日数'
    },
    {
      key: 'certificate_expiry_alert_days',
      value: '30',
      description: '資格期限アラートの日数'
    },
    {
      key: 'health_check_alert_days',
      value: '90',
      description: '健康診断期限アラートの日数'
    },
    {
      key: 'evaluation_period_months',
      value: '3',
      description: '評価期間（月）'
    },
    {
      key: 'interview_period_months',
      value: '3',
      description: '面談期間（月）'
    }
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }

  console.log('✅ システム設定を作成しました');

  console.log('🎉 シードデータの作成が完了しました！');
  console.log('');
  console.log('📋 作成されたデータ:');
  console.log('  - 管理者ユーザー: admin@talent-management.com (パスワード: admin123)');
  console.log('  - 部署ユーザー: dept@talent-management.com (パスワード: dept123)');
  console.log('  - スキルマスター: 5種類');
  console.log('  - 実習生サンプル: 3名');
  console.log('  - システム設定: 5項目');
}

main()
  .catch((e) => {
    console.error('❌ シードデータの作成に失敗しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

