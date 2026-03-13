import React, { useState } from 'react';
import { useLeaderboardCategories, useLeaderboardEntries, useUserPosition } from '@/service/leaderboard-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal, Award, Crown, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { AppRoute } from '@/constants/app-route';

export const LeaderboardPage: React.FC = () => {
  const { data: categories, isLoading: isLoadingCategories } = useLeaderboardCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Select first category by default when categories load
  React.useEffect(() => {
    if (categories?.data && categories.data.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories.data[0].id);
    }
  }, [categories, selectedCategoryId]);

  const { data: leaderboardData, isLoading: isLoadingEntries } = useLeaderboardEntries(
    selectedCategoryId,
    50
  );
  const { data: userPosition } = useUserPosition(selectedCategoryId);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-amber-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-300" />;
      default:
        return null;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case 3:
        return "bg-gradient-to-r from-orange-300 to-amber-400 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRowClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-50 to-yellow-50";
      case 2:
        return "bg-gray-50";
      case 3:
        return "bg-gradient-to-r from-orange-50 to-amber-50";
      default:
        return "";
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-2 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tighter">
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          See who's at the top of their game with the highest CV scores.
        </p>
      </div>

      {/* Category Selection */}
      {categories?.data && categories.data.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {categories.data.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategoryId === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategoryId(category.id)}
              className={selectedCategoryId === category.id ? "bg-gradient-to-r from-orange-500 to-orange-600" : ""}
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}

      {/* User's Current Position */}
      {userPosition?.data && (
        <Card className="w-full max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-2xl">
                  #{userPosition.data.position}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold">Position {userPosition.data.position}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Score</p>
                  <p className="text-xl font-bold">{userPosition.data.totalScore}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-muted-foreground">CV Score</p>
                  <p className="text-xl font-bold">{userPosition.data.cvScore}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500" />
            {leaderboardData?.data?.category?.name || 'Leaderboard'}
          </CardTitle>
          <CardDescription>
            Top performers ranked by their overall scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEntries ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : leaderboardData?.data?.entries && leaderboardData.data.entries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      CV Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData.data.entries.map((entry) => (
                    <tr key={entry.userId} className={getRowClass(entry.rank)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getRankIcon(entry.rank)}
                          <span className={`text-xl font-bold ${entry.rank <= 3 ? 'text-slate-800' : 'text-slate-600'}`}>
                            {entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${entry.rank <= 3 ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                          {entry.userName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="font-semibold">
                          {entry.cvScore}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center justify-center text-sm font-bold rounded-full h-8 w-20 ${getRankBadgeClass(entry.rank)}`}>
                          {entry.totalScore}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No leaderboard entries available yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back to Dashboard */}
      <div className="flex justify-center">
        <Link to={AppRoute.user.cvAnalysis.url}>
          <Button variant="outline">
            Kembali ke Analisis CV
          </Button>
        </Link>
      </div>
    </div>
  );
};
