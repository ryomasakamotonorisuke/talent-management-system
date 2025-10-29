export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          海外技能実習生タレントマネジメントシステム
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          実習生の情報、資格、スキル、育成計画、評価履歴を一元管理
        </p>
        <div className="space-x-4">
          <a
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg inline-block transition-colors"
          >
            ダッシュボードへ
          </a>
          <a
            href="/login"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg inline-block transition-colors"
          >
            ログイン
          </a>
        </div>
      </div>
    </div>
  );
}