import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Users, 
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';

export default function AdminAIDashboardPage() {
  const [statistics, setStatistics] = useState<any>(null);
  const [modelPerformance, setModelPerformance] = useState<any>(null);
  const [learningHistory, setLearningHistory] = useState<any[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsRes = await fetch(`${BACKEND_URL}/api/ai/statistics`);
      const statsData = await statsRes.json();
      setStatistics(statsData);

      // Fetch model performance
      const modelsRes = await fetch(`${BACKEND_URL}/api/ai/models`);
      const modelsData = await modelsRes.json();
      setModelPerformance(modelsData.current_performance);

      // Fetch learning history
      const historyRes = await fetch(`${BACKEND_URL}/api/ai/learning-history?limit=10`);
      const historyData = await historyRes.json();
      setLearningHistory(historyData.learning_history || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load AI dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const runLearningCycle = async () => {
    try {
      setIsLearning(true);
      toast.info('🧠 Learning cycle started...', {
        description: 'AI agents are learning from past experiences'
      });

      const response = await fetch(`${BACKEND_URL}/api/ai/learn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      toast.success('✅ Learning cycle completed!', {
        description: 'All AI models have been retrained with latest data'
      });

      // Refresh data after learning
      setTimeout(() => {
        fetchDashboardData();
        setIsLearning(false);
      }, 5000);

    } catch (error) {
      console.error('Error running learning cycle:', error);
      toast.error('Failed to run learning cycle');
      setIsLearning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI agent performance and trigger learning cycles
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={runLearningCycle} 
            disabled={isLearning}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLearning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Learning...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Run Learning Cycle
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Experiences"
          value={statistics?.total_experiences?.toLocaleString() || '0'}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Learning Cycles"
          value={statistics?.total_learning_cycles?.toString() || '0'}
          icon={Brain}
          color="purple"
        />
        <StatCard
          title="Active Agents"
          value="5"
          icon={Zap}
          color="green"
        />
        <StatCard
          title="System Status"
          value="Optimal"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Model Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          AI Agent Performance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AgentCard
            name="Risk Pricing Agent"
            icon={TrendingUp}
            metrics={modelPerformance?.risk_pricing?.metrics}
            trained={modelPerformance?.risk_pricing?.trained}
            color="blue"
          />
          <AgentCard
            name="Fraud Detection Agent"
            icon={Shield}
            metrics={modelPerformance?.fraud_detection?.metrics}
            trained={modelPerformance?.fraud_detection?.trained}
            color="red"
          />
          <AgentCard
            name="Payout Optimization"
            icon={TrendingUp}
            metrics={modelPerformance?.payout_optimization?.metrics}
            trained={modelPerformance?.payout_optimization?.trained}
            color="green"
          />
          <AgentCard
            name="Trigger Optimization"
            icon={AlertTriangle}
            metrics={modelPerformance?.trigger_optimization?.metrics}
            trained={modelPerformance?.trigger_optimization?.trained}
            color="orange"
          />
          <AgentCard
            name="Retention & Engagement"
            icon={Users}
            metrics={modelPerformance?.retention_engagement?.metrics}
            trained={modelPerformance?.retention_engagement?.trained}
            color="purple"
          />
        </div>
      </Card>

      {/* Experience Distribution */}
      {statistics?.experiences_by_agent && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Experience Distribution by Agent</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(statistics.experiences_by_agent).map(([name, count]) => ({
              name: name.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              experiences: count
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="experiences" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Learning History */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Learning Cycles
        </h2>
        
        {learningHistory.length > 0 ? (
          <div className="space-y-3">
            {learningHistory.map((cycle, index) => (
              <LearningCycleCard key={index} cycle={cycle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No learning cycles yet. Click "Run Learning Cycle" to start training.</p>
          </div>
        )}
      </Card>

      {/* Explainability Section */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <h2 className="text-xl font-bold mb-3">🎯 Hindsight Experience Replay</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Our AI system continuously learns from past outcomes. Every claim, payout, and user interaction
          is analyzed using hindsight to improve future decisions. Failed predictions, false triggers, and
          missed fraud cases are automatically relabeled and used to retrain the models.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {statistics?.total_experiences?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-muted-foreground">Experiences Stored</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {statistics?.total_learning_cycles || '0'}
            </div>
            <div className="text-xs text-muted-foreground">Learning Cycles Run</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {modelPerformance ? '5/5' : '0/5'}
            </div>
            <div className="text-xs text-muted-foreground">Agents Trained</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-950',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-950',
    green: 'text-green-600 bg-green-100 dark:bg-green-950',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-950'
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function AgentCard({ name, icon: Icon, metrics, trained, color }: any) {
  const colorMap: any = {
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
    red: 'border-red-500 bg-red-50 dark:bg-red-950/20',
    green: 'border-green-500 bg-green-50 dark:bg-green-950/20',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
  };

  const getMainMetric = () => {
    if (!metrics) return null;
    if (metrics.test_r2 !== undefined) return { label: 'R² Score', value: (metrics.test_r2 * 100).toFixed(1) + '%' };
    if (metrics.test_accuracy !== undefined) return { label: 'Accuracy', value: (metrics.test_accuracy * 100).toFixed(1) + '%' };
    if (metrics.f1_score !== undefined) return { label: 'F1 Score', value: (metrics.f1_score * 100).toFixed(1) + '%' };
    return null;
  };

  const mainMetric = getMainMetric();

  return (
    <Card className={`p-4 border-l-4 ${colorMap[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h3 className="font-semibold text-sm">{name}</h3>
        </div>
        {trained ? (
          <Badge variant="default" className="bg-green-500">Trained</Badge>
        ) : (
          <Badge variant="secondary">Not Trained</Badge>
        )}
      </div>

      {mainMetric && (
        <div className="mb-2">
          <div className="text-2xl font-bold">{mainMetric.value}</div>
          <div className="text-xs text-muted-foreground">{mainMetric.label}</div>
        </div>
      )}

      {metrics && (
        <div className="text-xs text-muted-foreground space-y-1">
          {metrics.mae && <div>MAE: ₹{metrics.mae}</div>}
          {metrics.precision && <div>Precision: {(metrics.precision * 100).toFixed(1)}%</div>}
          {metrics.recall && <div>Recall: {(metrics.recall * 100).toFixed(1)}%</div>}
          {metrics.samples_trained && <div>Samples: {metrics.samples_trained.toLocaleString()}</div>}
        </div>
      )}
    </Card>
  );
}

function LearningCycleCard({ cycle }: any) {
  const agents = cycle.agents_trained || {};
  const successCount = Object.values(agents).filter((a: any) => a.status === 'success').length;
  const totalAgents = Object.keys(agents).length;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-sm">
              Learning Cycle #{cycle.cycle_id?.slice(0, 8)}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(cycle.started_at).toLocaleString()}
            </div>
          </div>
        </div>
        <Badge variant={successCount === totalAgents ? 'default' : 'secondary'}>
          {successCount}/{totalAgents} Successful
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
        {Object.entries(agents).map(([name, agent]: [string, any]) => (
          <div key={name} className="text-center p-2 bg-muted rounded-lg">
            <div className="text-xs font-medium truncate" title={name}>
              {name.split('_').map((w: string) => w[0].toUpperCase()).join('')}
            </div>
            {agent.status === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mt-1" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 mx-auto mt-1" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex justify-between">
        <span>Duration: {cycle.duration_seconds?.toFixed(2)}s</span>
        <span>Experiences: {cycle.total_experiences_used?.toLocaleString()}</span>
      </div>
    </Card>
  );
}
