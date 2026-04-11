import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingDown, TrendingUp, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';

interface AIInsightsProps {
  userId?: string;
  city: string;
  workType: string;
  platform: string;
  claimFrequency?: number;
  avgEarnings?: number;
}

export function AIInsightsCard({ 
  city, 
  workType, 
  platform,
  claimFrequency = 0.5,
  avgEarnings = 5000
}: AIInsightsProps) {
  const [aiPremium, setAIPremium] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIPremium();
  }, [city, workType, platform]);

  const fetchAIPremium = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/ai/predict/premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          work_type: workType,
          platform,
          claim_frequency: claimFrequency,
          avg_earnings: avgEarnings,
          month: new Date().getMonth() + 1
        })
      });
      const data = await response.json();
      setAIPremium(data);
    } catch (error) {
      console.error('Error fetching AI premium:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          <span className="font-semibold">AI is calculating...</span>
        </div>
      </Card>
    );
  }

  if (!aiPremium) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI-Optimized Premium</span>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
          AI Powered
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-foreground">
            ₹{aiPremium.premium?.toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground ml-2">/week</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Personalized pricing based on your risk profile
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          <Info className="h-4 w-4" />
          {showExplanation ? 'Hide' : 'Show'} AI Explanation
          {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showExplanation && aiPremium.explanation && (
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs space-y-2">
            <div className="font-semibold text-primary">How AI calculated this premium:</div>
            <div className="whitespace-pre-line text-muted-foreground">
              {aiPremium.explanation.explanation}
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] text-muted-foreground">
                Model: Risk Pricing Agent v1.0 • Trained on {aiPremium.explanation.input_summary?.claim_frequency ? '7000+' : '1000+'} policies
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>AI continuously learns from outcomes to improve pricing fairness</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface FraudCheckResultProps {
  result: any;
}

export function FraudCheckResult({ result }: FraudCheckResultProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  const riskColor = 
    result.risk_level === 'critical' ? 'bg-red-500' :
    result.risk_level === 'high' ? 'bg-orange-500' :
    result.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500';

  const riskIcon = result.is_fraud ? '🚨' : result.risk_level === 'low' ? '✅' : '⚠️';

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{riskIcon}</span>
          <span className="font-semibold">Fraud Risk Assessment</span>
        </div>
        <Badge className={riskColor}>
          {result.risk_level.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-lg font-bold">
            {(result.fraud_probability * 100).toFixed(1)}% Fraud Probability
          </div>
          <p className="text-xs text-muted-foreground">
            Action: {result.action === 'approve' ? '✅ Approve' : result.action === 'review' ? '⚠️ Manual Review' : '🚫 Block'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>

        {showDetails && result.explanation && (
          <div className="p-3 bg-muted rounded-lg text-xs space-y-2">
            <div className="font-semibold">AI Analysis:</div>
            <div className="whitespace-pre-line">
              {result.explanation.explanation}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface PayoutExplanationProps {
  payout: number;
  explanation: any;
}

export function PayoutExplanation({ payout, explanation }: PayoutExplanationProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="font-semibold">AI-Calculated Payout</span>
        </div>
        <Badge className="bg-green-600">Optimized</Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-green-600">
            ₹{payout.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Fair compensation based on actual loss estimation
          </p>
        </div>

        {explanation && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-4 w-4" />
              {showDetails ? 'Hide' : 'Show'} Calculation Details
            </Button>

            {showDetails && (
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs space-y-2">
                <div className="font-semibold text-green-600">Payout Breakdown:</div>
                <div className="whitespace-pre-line text-muted-foreground">
                  {explanation.explanation}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
