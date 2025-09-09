/**
 * Home Page - Pin Rhythm Game Welcome Screen
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  Play, 
  Music, 
  Settings, 
  Download,
  Zap,
  RotateCw,
  Medal
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    songsImported: 0,
    totalPlays: 0,
    highScore: 0,
    accuracy: 0
  });

  useEffect(() => {
    // TODO: Load stats from backend
    setStats({
      songsImported: 12,
      totalPlays: 45,
      highScore: 125800,
      accuracy: 87.5
    });
  }, []);

  const quickActions = [
    {
      title: 'Start Playing',
      description: 'Jump into Pin Mode or osu! style gameplay',
      icon: Play,
      color: 'from-purple-500 to-pink-500',
      href: '/play'
    },
    {
      title: 'Browse Library',
      description: 'Manage your .osz files and beatmaps',
      icon: Music,
      color: 'from-blue-500 to-cyan-500',
      href: '/select'
    },
    {
      title: 'Settings',
      description: 'Customize your rhythm experience',
      icon: Settings,
      color: 'from-green-500 to-teal-500',
      href: '/settings'
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Target className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-slate-900" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            Pin Rhythm
          </h1>
          <p className="text-2xl text-slate-300 mb-6 max-w-3xl mx-auto">
            Experience osu! beatmaps in a completely new way
          </p>
          <p className="text-lg text-slate-400 mb-8">
            Throw pins at spinning targets, follow the rhythm, and master the timing
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 text-lg h-auto"
            >
              <Target className="w-6 h-6 mr-2" />
              Try Pin Mode
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 px-8 py-4 text-lg h-auto"
            >
              <Download className="w-6 h-6 mr-2" />
              Import .osz Files
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="text-center">
                <Music className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.songsImported}</div>
                <div className="text-slate-400 text-sm">Songs</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="text-center">
                <Play className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalPlays}</div>
                <div className="text-slate-400 text-sm">Plays</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="text-center">
                <Medal className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.highScore.toLocaleString()}</div>
                <div className="text-slate-400 text-sm">High Score</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.accuracy}%</div>
                <div className="text-slate-400 text-sm">Accuracy</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{action.title}</CardTitle>
                  <CardDescription className="text-slate-300">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              Why Pin Rhythm?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">osu! Compatible</h3>
                <p className="text-slate-400">
                  Use your existing .osz beatmaps with a fresh new gameplay style
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCw className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Pin Mode</h3>
                <p className="text-slate-400">
                  Knife Hit inspired gameplay meets rhythm gaming precision
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Easy to Learn</h3>
                <p className="text-slate-400">
                  Intuitive controls that focus on timing over complex movements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
