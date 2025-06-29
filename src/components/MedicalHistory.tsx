import React, { useState, useEffect } from 'react';
import { userDataManager, MedicalHistory as MedicalHistoryType } from '@/utils/userDataManager';
import { Button } from '@/components/ui/button';
import { History, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from '@/utils/dateUtils';

export const MedicalHistory: React.FC = () => {
  const [history, setHistory] = useState<MedicalHistoryType[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalHistoryType | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const medicalHistory = userDataManager.getMedicalHistory();
    setHistory(medicalHistory.sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-400/30';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const exportHistory = () => {
    try {
      const data = userDataManager.exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export history:', error);
    }
  };

  if (history.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 bg-black/20 rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <History className="size-4 sm:size-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Medical History</h3>
        </div>
        <div className="text-center py-6 sm:py-8">
          <FileText className="size-10 sm:size-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-sm sm:text-base">No medical history found</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Your consultation history will appear here after your first session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 bg-black/20 rounded-lg border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-4 sm:size-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Medical History</h3>
          <span className="text-xs sm:text-sm text-gray-400">({history.length} records)</span>
        </div>
        <Button
          onClick={exportHistory}
          variant="outline"
          className="text-white border-white/30 hover:bg-white/10 text-xs sm:text-sm h-8 sm:h-9"
        >
          Export History
        </Button>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
        {history.map((record) => (
          <div
            key={record.id}
            className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedRecord(record);
              setShowDetails(true);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="size-3 sm:size-4 text-gray-400" />
                <span className="text-white font-medium text-xs sm:text-sm">
                  {format(record.date, 'MMM dd, yyyy')}
                </span>
                <span className="text-gray-400 text-xs">
                  {format(record.date, 'HH:mm')}
                </span>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border",
                getRiskColor(record.riskLevel)
              )}>
                {record.riskLevel.toUpperCase()} ({record.riskScore}/100)
              </div>
            </div>

            <div className="mb-2">
              <span className="text-xs sm:text-sm text-gray-300">Department: </span>
              <span className="text-white font-medium text-xs sm:text-sm">{record.department}</span>
            </div>

            <div className="mb-2">
              <span className="text-xs sm:text-sm text-gray-300">Symptoms: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {record.symptoms.slice(0, 3).map((symptom, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded">
                    {symptom}
                  </span>
                ))}
                {record.symptoms.length > 3 && (
                  <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">
                    +{record.symptoms.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {record.followUpRequired && (
              <div className="flex items-center gap-1 text-orange-300 text-xs sm:text-sm">
                <AlertTriangle className="size-3" />
                Follow-up required
                {record.followUpDate && (
                  <span className="text-gray-400">
                    by {format(record.followUpDate, 'MMM dd')}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Medical Record Details</h3>
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="ghost"
                  className="text-white hover:bg-white/10 h-8 w-8"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs sm:text-sm text-gray-300">Date & Time:</span>
                    <p className="text-white font-medium text-sm sm:text-base">
                      {format(selectedRecord.date, 'MMMM dd, yyyy at HH:mm')}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-gray-300">Department:</span>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedRecord.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs sm:text-sm text-gray-300">Risk Level:</span>
                    <div className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium border mt-1",
                      getRiskColor(selectedRecord.riskLevel)
                    )}>
                      {selectedRecord.riskLevel.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-gray-300">Risk Score:</span>
                    <p className="text-white font-medium text-base sm:text-lg">{selectedRecord.riskScore}/100</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs sm:text-sm text-gray-300">Symptoms:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRecord.symptoms.map((symptom, index) => (
                      <span key={index} className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-200 text-xs sm:text-sm rounded-full">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedRecord.diagnosis && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-300">Diagnosis:</span>
                    <p className="text-white mt-1 text-sm">{selectedRecord.diagnosis}</p>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-300">Notes:</span>
                    <p className="text-white mt-1 whitespace-pre-wrap text-sm">{selectedRecord.notes}</p>
                  </div>
                )}

                {selectedRecord.followUpRequired && (
                  <div className="p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-300 font-medium text-sm">
                      <AlertTriangle className="size-4" />
                      Follow-up Required
                    </div>
                    {selectedRecord.followUpDate && (
                      <p className="text-orange-200 text-xs sm:text-sm mt-1">
                        Scheduled for: {format(selectedRecord.followUpDate, 'MMMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};