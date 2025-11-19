interface LawyerTypeCardProps {
  title: string
  totalHours: number
  totalMinutes: number
  chatCount: number
  colorScheme: 'blue' | 'green'
}

export default function LawyerTypeCard({
  title,
  totalHours,
  totalMinutes,
  chatCount,
  colorScheme,
}: LawyerTypeCardProps) {
  const isBlue = colorScheme === 'blue'
  const bgColor = isBlue ? 'bg-blue-50/50' : 'bg-green-50/50'
  const borderColor = isBlue ? 'border-blue-100' : 'border-green-100'
  const textColor = isBlue ? 'text-blue-600' : 'text-green-600'
  const badgeBg = isBlue ? 'bg-blue-100' : 'bg-green-100'
  const badgeText = isBlue ? 'text-blue-700' : 'text-green-700'
  const avgMinutes = Math.round(totalMinutes / chatCount)

  return (
    <div className={`${bgColor} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <span
          className={`text-xs font-semibold ${badgeText} ${badgeBg} px-2.5 py-1 rounded-full`}
        >
          {chatCount} chats
        </span>
      </div>
      <div className={`text-4xl font-bold ${textColor} mb-2`}>
        {totalHours}h
      </div>
      <div className="text-sm text-gray-600">
        {avgMinutes} min average per conversation
      </div>
    </div>
  )
}

