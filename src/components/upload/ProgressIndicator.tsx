
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  progress: number;
  isVisible: boolean;
}

const ProgressIndicator = ({ progress, isVisible }: ProgressIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-4 bg-white">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-900">Progresso da análise</span>
            <span className="text-gray-900">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressIndicator;
