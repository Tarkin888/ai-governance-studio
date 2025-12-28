'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Database, 
  FileCheck, 
  Shield, 
  Scale, 
  Building2, 
  AlertTriangle, 
  Users, 
  ShoppingCart, 
  FileText, 
  GraduationCap 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  name: string
  href: string
  icon: any
  active: boolean
  comingSoon?: boolean
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false, comingSoon: true },
  { name: 'AI System Inventory', href: '/', icon: Database, active: true },
  { name: 'Regulatory Compliance', href: '/regulatory-compliance', icon: FileCheck, active: true },
  { name: 'Risk Assessment', href: '/risk', icon: Shield, active: false, comingSoon: true },
  { name: 'Bias & Fairness Testing', href: '/bias-fairness', icon: Scale, active: true },
  { name: 'Model Card Library', href: '/model-cards', icon: FileText, active: true },
  { name: 'Vendor Management', href: '/vendors', icon: Building2, active: false, comingSoon: true },
  { name: 'Incident Management', href: '/incidents', icon: AlertTriangle, active: false, comingSoon: true },
  { name: 'Ethics Committee', href: '/ethics', icon: Users, active: false, comingSoon: true },
  { name: 'Procurement', href: '/procurement', icon: ShoppingCart, active: false, comingSoon: true },
  { name: 'Board Reporting', href: '/reporting', icon: FileText, active: false, comingSoon: true },
  { name: 'Training Centre', href: '/training', icon: GraduationCap, active: false, comingSoon: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleComingSoonClick = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is coming soon. We're working on it!",
    })
  }

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold">AI Governance</h1>
            <p className="text-xs text-slate-400">Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <TooltipProvider delayDuration={300}>
          {navItems?.map((item) => {
            const Icon = item?.icon
            const isActive = pathname === item?.href
            const isDisabled = item?.comingSoon

            if (isDisabled) {
              return (
                <Tooltip key={item?.name}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={handleComingSoonClick}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 cursor-not-allowed transition-opacity hover:opacity-60"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm flex-1">{item?.name}</span>
                      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded">Soon</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    <p className="text-sm">This feature is under development</p>
                    <p className="text-xs text-slate-400 mt-1">Expected availability: Q2 2026</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={item?.name}
                href={item?.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item?.name}</span>
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        <p>ISO 42001 Compliance</p>
        <p className="mt-1">Version 1.0.0</p>
      </div>
    </div>
  )
}
