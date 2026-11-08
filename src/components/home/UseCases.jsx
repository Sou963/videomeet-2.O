"use client";

import { Briefcase, GraduationCap, Users, HeartHandshake, CheckCircle2 } from "lucide-react";

const useCases = [
  {
    icon: Briefcase,
    color: "from-blue-600 to-indigo-600",
    bg: "bg-blue-50 text-blue-600",
    title: "Remote Teams",
    tagline: "Productive Standups",
    description:
      "Run daily standups, review PRs, host brainstorming sessions, and sync across timezones without lag.",
    points: ["Screen sharing", "Meeting recording ready", "Group chat"],
  },
  {
    icon: GraduationCap,
    color: "from-emerald-600 to-teal-600",
    bg: "bg-emerald-50 text-emerald-600",
    title: "Education & Classes",
    tagline: "Interactive Learning",
    description:
      "Host virtual lectures, group study rooms, and one-on-one student tutoring sessions seamlessly.",
    points: ["Hand raising", "Live Q&A reactions", "Private room codes"],
  },
  {
    icon: Users,
    color: "from-purple-600 to-indigo-600",
    bg: "bg-purple-50 text-purple-600",
    title: "Cross-Border Teams",
    tagline: "Global Reach",
    description:
      "Collaborate internationally with live AI speech translation to eliminate language barriers completely.",
    points: ["AI Voice translation", "Low bandwidth mode", "Global servers"],
  },
  {
    icon: HeartHandshake,
    color: "from-rose-600 to-pink-600",
    bg: "bg-rose-50 text-rose-600",
    title: "Friends & Family",
    tagline: "Stay Connected",
    description:
      "Catch up with friends, celebrate family milestones, or hang out online with simple 1-click joining.",
    points: ["No download required", "Mobile friendly", "Instant link sharing"],
  },
];

export default function UseCases() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
            Versatile Solutions
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Tailored for how modern teams communicate
          </h2>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Whether for high-stakes corporate syncs, classroom lectures, or casual social calls, VideoMeet delivers dependable performance.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} transition-transform duration-300 group-hover:scale-110 shadow-xs`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <span className="mt-6 block text-xs font-bold tracking-wider uppercase text-blue-600">
                    {item.tagline}
                  </span>

                  <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 space-y-2">
                  {item.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
