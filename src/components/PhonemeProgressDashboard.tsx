"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PhonemeEvaluationService } from "@/lib/services/phoneme-evaluation";
import { RefreshCw } from "lucide-react";

interface PhonemeStats {
  points: number;
  count: number;
  streak: number;
  flexibility: number;
  learningRate: number;
  averageScore: number;
  lastUpdated: string;
}

interface PhonemePerformance {
  totalPhonemes: number;
  averagePoints: number;
  strongPhonemes: Array<{
    phoneme: string;
    points: number;
    averageScore: number;
    streak: number;
  }>;
  weakPhonemes: Array<{
    phoneme: string;
    points: number;
    averageScore: number;
    streak: number;
  }>;
  totalPracticeCount: number;
}

export default function PhonemeProgressDashboard() {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const t = useTranslations(currentLanguage);

  const [phonemeStats, setPhonemeStats] = useState<
    Record<string, PhonemeStats>
  >({});
  const [performance, setPerformance] = useState<PhonemePerformance | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "strong" | "weak"
  >("all");

  const fetchPhonemeData = async () => {
    if (!user) return;

    try {
      setRefreshing(true);
      const data = await PhonemeEvaluationService.getUserPhonemePerformance(
        user.uid
      );
      if (data) {
        setPhonemeStats(data.phonemeStats || {});
        setPerformance(data.performance || null);
      }
    } catch (error) {
      console.error("Error fetching phoneme data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Only fetch data once when component mounts
  useEffect(() => {
    fetchPhonemeData();
  }, [user]);

  const getPhonemeDescription = (phoneme: string): string => {
    const descriptions: Record<string, string> = {
      AE: "Short A sound (cat, bat)",
      AA: "Father A sound (hot, got)",
      AH: "Schwa sound (about, but)",
      AO: "Thought sound (caught, law)",
      IY: "Long E sound (see, tree)",
      IH: "Short I sound (sit, bit)",
      UW: "Long OO sound (too, blue)",
      UH: "Short OO sound (book, good)",
      EH: "Short E sound (bed, red)",
      EY: "Long A sound (say, make)",
      OW: "Long O sound (go, show)",
      TH: "Voiceless TH (think, bath)",
      DH: "Voiced TH (this, the)",
      SH: "SH sound (shop, wash)",
      ZH: "Measure sound (vision)",
      CH: "CH sound (chair, watch)",
      JH: "J sound (jump, bridge)",
      NG: "NG sound (sing, ring)",
      HH: "H sound (hat, house)",
      P: "P sound (pat, cup)",
      B: "B sound (bat, cab)",
      T: "T sound (top, cat)",
      D: "D sound (dog, bad)",
      K: "K sound (cat, back)",
      G: "G sound (go, bag)",
      F: "F sound (fat, leaf)",
      V: "V sound (van, love)",
      S: "S sound (sat, pass)",
      Z: "Z sound (zip, buzz)",
      M: "M sound (man, come)",
      N: "N sound (no, sun)",
      L: "L sound (let, ball)",
      R: "R sound (run, car)",
      Y: "Y sound (yes, you)",
      W: "W sound (wet, away)",
    };
    return descriptions[phoneme] || `${phoneme} sound`;
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 5) return "text-green-600";
    if (streak >= 3) return "text-blue-600";
    if (streak >= 1) return "text-yellow-600";
    return "text-red-600";
  };

  const getPointsColor = (points: number): string => {
    if (points >= 50) return "text-green-600";
    if (points >= 25) return "text-blue-600";
    if (points >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-600">
          Please log in to view your phoneme progress.
        </p>
      </div>
    );
  }

  const filteredPhonemes = Object.entries(phonemeStats).filter(
    ([phoneme, stats]) => {
      if (selectedCategory === "strong") {
        return stats.points >= 25 && stats.averageScore >= 80;
      }
      if (selectedCategory === "weak") {
        return stats.points < 15 || stats.averageScore < 70;
      }
      return true; // 'all'
    }
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Phoneme Progress Dashboard
          </h1>
          <p className="text-gray-600">
            Track your pronunciation improvement across individual sounds
          </p>
        </div>
        <Button
          onClick={fetchPhonemeData}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Performance Summary */}
      {performance && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Total Phonemes</h3>
            <p className="text-2xl font-bold text-blue-600">
              {performance.totalPhonemes}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Average Points</h3>
            <p className="text-2xl font-bold text-green-600">
              {performance.averagePoints.toFixed(1)}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-2">
              Strong Phonemes
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {performance.strongPhonemes.length}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Total Practice</h3>
            <p className="text-2xl font-bold text-purple-600">
              {performance.totalPracticeCount}
            </p>
          </Card>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
        >
          All Phonemes ({Object.keys(phonemeStats).length})
        </Button>
        <Button
          variant={selectedCategory === "strong" ? "default" : "outline"}
          onClick={() => setSelectedCategory("strong")}
        >
          Strong ({performance?.strongPhonemes.length || 0})
        </Button>
        <Button
          variant={selectedCategory === "weak" ? "default" : "outline"}
          onClick={() => setSelectedCategory("weak")}
        >
          Needs Work ({performance?.weakPhonemes.length || 0})
        </Button>
      </div>

      {/* Phoneme Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPhonemes.map(([phoneme, stats]) => (
          <Card key={phoneme} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{phoneme}</h3>
                <p className="text-sm text-gray-600">
                  {getPhonemeDescription(phoneme)}
                </p>
              </div>
              <span
                className={`text-lg font-bold ${getPointsColor(stats.points)}`}
              >
                {stats.points.toFixed(1)}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Average Score</span>
                  <span>{stats.averageScore.toFixed(1)}%</span>
                </div>
                <Progress value={stats.averageScore} className="h-2" />
              </div>

              <div className="flex justify-between text-sm">
                <span>Practice Count:</span>
                <span className="font-semibold">{stats.count}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Streak:</span>
                <span
                  className={`font-semibold ${getStreakColor(stats.streak)}`}
                >
                  {stats.streak > 0 ? `+${stats.streak}` : stats.streak}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Learning Rate:</span>
                <span className="font-semibold">
                  {stats.learningRate.toFixed(2)}x
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Flexibility:</span>
                <span className="font-semibold">
                  {stats.flexibility.toFixed(1)}
                </span>
              </div>

              <div className="text-xs text-gray-500">
                Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPhonemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {selectedCategory === "all"
              ? "No phoneme data available yet. Start practicing to see your progress!"
              : `No phonemes in the "${selectedCategory}" category yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
