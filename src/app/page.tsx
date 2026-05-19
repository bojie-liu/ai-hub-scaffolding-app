'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Monitor, BarChart3, Users, Brain, Target, Clock, LogIn, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">KM</div>
            <span className="font-semibold text-slate-800">Knowledge Management & School Development</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/lesson">
                <Button size="sm" className="gap-1.5">
                  <BookOpen className="h-4 w-4" /> Go to Lesson
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" /> Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Clock className="h-4 w-4" /> 180 minutes | 90 students | First-year undergraduates
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Knowledge Management<br />and School Development
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Explore how IT and knowledge management strategies transform educational institutions.
          Analyze, evaluate, and create KM solutions for real school contexts.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/lesson">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" /> View Lesson Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/slides">
            <Button size="lg" variant="outline" className="gap-2">
              <Monitor className="h-5 w-5" /> Presentation Slides
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Interactive Learning</h3>
              <p className="text-sm text-muted-foreground">Quizzes, discussions, and concept checks to reinforce key KM concepts.</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">SECI Framework</h3>
              <p className="text-sm text-muted-foreground">Explore Nonaka & Takeuchi&apos;s knowledge conversion model with interactive visualization.</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Collaborative</h3>
              <p className="text-sm text-muted-foreground">Group case study analysis, peer teaching, and speed-dating strategy sessions.</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">Teachers monitor student progress, quiz scores, and concept check responses.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ILOs Preview */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-6">Intended Learning Outcomes</h2>
        <div className="space-y-3">
          {[
            { num: 1, text: 'Analyze how rapid IT and internet development impacts knowledge creation and sharing in educational settings.', verb: 'Analyze' },
            { num: 2, text: 'Evaluate the effectiveness of existing knowledge management (KM) strategies in addressing school leadership challenges.', verb: 'Evaluate' },
            { num: 3, text: 'Create a tailored KM strategy for a hypothetical school context, integrating knowledge auditing and sharing mechanisms.', verb: 'Create' },
            { num: 4, text: 'Apply techniques to identify and assess knowledge assets within an organization.', verb: 'Apply' },
          ].map((ilo) => (
            <div key={ilo.num} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-slate-200">
              <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">{ilo.num}</span>
              <div>
                <span className="text-sm font-semibold text-blue-600">{ilo.verb}: </span>
                <span className="text-sm text-slate-700">{ilo.text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Knowledge Management & School Development | Lesson Plan Platform
        </div>
      </footer>
    </div>
  );
}
