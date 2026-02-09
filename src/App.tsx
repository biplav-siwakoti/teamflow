import { useState, useEffect } from 'react';
import { 
  Clock, 
  Shield, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  FileText,
  Lock,
  Zap,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Building2,
  Briefcase,
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import Planner from './Planner';

// Navigation Component
function Navigation({ currentPage, setCurrentPage }: { currentPage: string; setCurrentPage: (page: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'security', label: 'Security' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'templates', label: 'Templates' },
    { id: 'planner', label: 'Try MVP', highlight: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 font-bold text-xl text-slate-900"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            TeamFlow
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  link.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : currentPage === link.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentPage(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                  link.highlight
                    ? 'bg-blue-600 text-white mb-2'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 -z-10" />
      <div className="absolute top-20 right-0 w-1/3 h-1/3 bg-blue-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-100/50 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1.5 text-sm font-medium">
              Built for Audit & Accounting Firms
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Time Tracking That Understands{' '}
              <span className="text-blue-600">Engagements</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
              TeamFlow replaces spreadsheet chaos with purpose-built planning and timesheet 
              management designed for auditors and chartered accountants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                onClick={() => setCurrentPage('planner')}
              >
                Try the MVP Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setCurrentPage('features')}
              >
                See Features
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Firm-based pricing
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Engagement Timeline</p>
                    <p className="text-sm text-slate-500">ABC Corp Annual Audit</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                  In Progress
                </Badge>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Sarah Chen', role: 'Partner', task: 'Risk Assessment', hours: '4.5h', color: 'bg-blue-500' },
                  { name: 'Mike Ross', role: 'Manager', task: 'Control Testing', hours: '12h', color: 'bg-green-500' },
                  { name: 'Emma Davis', role: 'Senior', task: 'Substantive Procedures', hours: '8h', color: 'bg-purple-500' },
                  { name: 'James Wilson', role: 'Staff', task: 'Documentation', hours: '6h', color: 'bg-amber-500' },
                ].map((member, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className={`w-2 h-10 ${member.color} rounded-full`} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{member.task}</p>
                      <p className="text-sm text-slate-500">{member.hours}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500">Budget: 245 / 320 hours</p>
              </div>
            </div>
            
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">94%</p>
                  <p className="text-sm text-slate-500">Realization Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Pain Points Section
function PainPointsSection() {
  const painPoints = [
    {
      icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      title: 'Multi-Engagement Chaos',
      description: 'Staff juggle 5-10 engagements simultaneously. Time gets logged to wrong clients, budgets bleed into each other, and nobody knows who is working on what.',
    },
    {
      icon: <Clock className="w-8 h-8 text-red-500" />,
      title: 'Time Leakage',
      description: '15-30% of billable time never gets captured. Professionals forget to start timers, reconstruct days from memory, or simply give up on accurate tracking.',
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: 'Approval Bottlenecks',
      description: 'Managers spend 2-4 hours weekly reviewing timesheets line-by-line. Anomalies hide in the noise, and period-close becomes a recurring crisis.',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
      title: 'No Real-Time Visibility',
      description: 'Budget overruns surface after it is too late. Realization rates are calculated monthly. Planning and execution exist in separate universes.',
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            The Problems We Solve
          </h2>
          <p className="text-lg text-slate-600">
            Generic time tracking tools fail audit firms. Spreadsheets do not scale. 
            TeamFlow is built for the unique challenges of professional services.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {painPoints.map((point, i) => (
            <Card key={i} className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="mb-4">{point.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{point.title}</h3>
                <p className="text-slate-600 leading-relaxed">{point.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Engagement-Centric Architecture',
      description: 'Client → Engagement → Phase → Task → Activity hierarchy that maps to audit methodology.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Multiple Capture Methods',
      description: 'One-click timers, manual entry, calendar integration, and mobile offline capture.',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Smart Approvals',
      description: 'Hierarchical routing with exception highlighting, bulk operations, and delegation.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Real-Time Budget Visibility',
      description: 'See budget consumption at entry. Catch overruns before they become problems.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Immutable Audit Trails',
      description: 'Tamper-evident record keeping with cryptographic verification and full export.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'QuickBooks Integration',
      description: 'Bidirectional sync eliminates reconciliation. Time flows seamlessly to billing.',
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-blue-100 text-blue-700 mb-4">Features</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need, Nothing You Do not
          </h2>
          <p className="text-lg text-slate-600">
            Purpose-built for audit and accounting firms. No customization required.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      description: 'For firms getting started with engagement tracking',
      price: '$149',
      period: '/month',
      features: [
        'Up to 15 team members',
        'Unlimited engagements',
        'Basic approval workflows',
        'QuickBooks Online sync',
        'Mobile app access',
        'Email support',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      description: 'For growing firms with complex needs',
      price: '$299',
      period: '/month',
      features: [
        'Up to 50 team members',
        'Everything in Starter',
        'Multi-level approvals',
        'Resource planning',
        'Advanced analytics',
        'API access',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      description: 'For established firms requiring full control',
      price: 'Custom',
      period: '',
      features: [
        'Unlimited team members',
        'Everything in Professional',
        'SSO / SAML',
        'Custom integrations',
        'Dedicated success manager',
        'SLA guarantee',
        'On-premise option',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-blue-100 text-blue-700 mb-4">Pricing</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Firm-Based Pricing, Not Per-Seat
          </h2>
          <p className="text-lg text-slate-600">
            Grow your team without growing your software bill. Predictable costs, 
            unlimited value.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <Card 
              key={i} 
              className={`relative ${plan.highlighted ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200'}`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.highlighted ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-center text-sm text-slate-500 mt-8">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-3xl p-12 lg:p-16 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your Firm?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Join audit and accounting firms who have replaced spreadsheet chaos 
            with purpose-built engagement management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setCurrentPage('planner')}
            >
              Try the MVP Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const footerLinks = {
    Product: [
      { label: 'Features', page: 'features' },
      { label: 'Security', page: 'security' },
      { label: 'Pricing', page: 'pricing' },
      { label: 'Templates', page: 'templates' },
    ],
    Company: [
      { label: 'About', page: 'home' },
      { label: 'Blog', page: 'home' },
      { label: 'Careers', page: 'home' },
      { label: 'Contact', page: 'home' },
    ],
    Resources: [
      { label: 'Documentation', page: 'home' },
      { label: 'Help Center', page: 'home' },
      { label: 'API Reference', page: 'home' },
      { label: 'Status', page: 'home' },
    ],
    Legal: [
      { label: 'Privacy', page: 'home' },
      { label: 'Terms', page: 'home' },
      { label: 'Security', page: 'security' },
      { label: 'Cookies', page: 'home' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <button 
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 font-bold text-xl text-white mb-4"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              TeamFlow
            </button>
            <p className="text-slate-400 max-w-sm">
              Purpose-built planning and timesheet management for auditors 
              and chartered accountants.
            </p>
          </div>
          
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <button 
                      onClick={() => setCurrentPage(link.page)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <Separator className="bg-slate-800" />
        
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2025 TeamFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-500">SOC 2 Type II Certified</span>
            <span className="text-sm text-slate-500">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Features Page
function FeaturesPage() {
  const featureCategories = [
    {
      title: 'Time Capture',
      icon: <Clock className="w-8 h-8" />,
      features: [
        { title: 'One-Click Timers', description: 'Start tracking in under a second with intelligent project suggestions based on context.' },
        { title: 'Manual Entry', description: 'Bulk weekly entry with duplicate detection and reasonableness validation.' },
        { title: 'Calendar Integration', description: 'Google and Outlook sync with attendee-to-client inference.' },
        { title: 'Mobile Offline', description: 'Native iOS and Android apps with full offline queue and background sync.' },
      ],
    },
    {
      title: 'Engagement Management',
      icon: <Briefcase className="w-8 h-8" />,
      features: [
        { title: '5-Level Hierarchy', description: 'Client → Engagement → Phase → Task → Activity structure matching audit methodology.' },
        { title: 'Budget Tracking', description: 'Real-time consumption visibility at every level with variance alerting.' },
        { title: 'Rate Management', description: 'Standard, negotiated, role-based, and task-premium rate structures.' },
        { title: 'WIP Valuation', description: 'Unbilled time aging and collectability assessment for cash flow management.' },
      ],
    },
    {
      title: 'Workflow & Approvals',
      icon: <CheckCircle className="w-8 h-8" />,
      features: [
        { title: 'Hierarchical Routing', description: 'Staff → Senior → Manager → Partner with firm-specific configuration.' },
        { title: 'Delegation', description: 'Time-bounded reassignment with full audit logging and automatic expiration.' },
        { title: 'Exception Handling', description: 'Anomalous entries automatically route for enhanced review.' },
        { title: 'Bulk Operations', description: 'Efficient processing of routine submissions with exception highlighting.' },
      ],
    },
    {
      title: 'Reporting & Analytics',
      icon: <BarChart3 className="w-8 h-8" />,
      features: [
        { title: 'Utilization Metrics', description: 'Individual and team capacity analysis with drill-down to source entries.' },
        { title: 'Realization Rates', description: 'Billed value versus time-recorded-at-standard-rate with automatic calculation.' },
        { title: 'Budget Variance', description: 'Plan-actual analysis with trend identification and forecasting.' },
        { title: 'Profitability Attribution', description: 'Margin analysis by engagement, client, and professional.' },
      ],
    },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-blue-100 text-blue-700 mb-4">Features</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything Your Firm Needs
          </h1>
          <p className="text-lg text-slate-600">
            Purpose-built capabilities for audit and accounting workflows. 
            No customization required.
          </p>
        </div>

        <div className="space-y-20">
          {featureCategories.map((category, i) => (
            <div key={i}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {category.features.map((feature, j) => (
                  <Card key={j} className="border-slate-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Security Page
function SecurityPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-green-100 text-green-700 mb-4">Security & Compliance</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Enterprise-Grade Security
          </h1>
          <p className="text-lg text-slate-600">
            Built for firms that face regulatory scrutiny. Your data is protected 
            by the same standards you apply to your clients.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Lock className="w-8 h-8" />,
              title: 'Encryption at Rest and in Transit',
              description: 'AES-256 encryption for stored data. TLS 1.3 for all network communications.',
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: 'SOC 2 Type II Certified',
              description: 'Independent audit of security controls, availability, and confidentiality.',
            },
            {
              icon: <FileText className="w-8 h-8" />,
              title: 'Immutable Audit Trails',
              description: 'Tamper-evident record keeping with cryptographic verification. Every action logged.',
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Role-Based Access Control',
              description: 'Granular permissions at engagement, client, and firm levels. No shared credentials.',
            },
            {
              icon: <Landmark className="w-8 h-8" />,
              title: 'Data Residency Options',
              description: 'Store data in US, EU, UK, Australia, or India to meet jurisdictional requirements.',
            },
            {
              icon: <CheckCircle className="w-8 h-8" />,
              title: 'GDPR Compliant',
              description: 'Right to access, rectification, erasure, and data portability built-in.',
            },
          ].map((item, i) => (
            <Card key={i} className="border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-200">
          <CardHeader className="p-8">
            <CardTitle className="text-xl">Compliance Standards</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Certifications</h4>
                <ul className="space-y-2">
                  {['SOC 2 Type II', 'ISO 27001', 'GDPR Compliant', 'CCPA Ready'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Audit Trail Features</h4>
                <ul className="space-y-2">
                  {['User attribution', 'Server-verified timestamps', 'Before/after state capture', 'Exportable evidence'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Pricing Page
function PricingPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-blue-100 text-blue-700 mb-4">Pricing</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Simple, Predictable Pricing
          </h1>
          <p className="text-lg text-slate-600">
            Firm-based tiers that grow with your success. No per-seat penalties. 
            No surprise charges.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              name: 'Starter',
              price: '$149',
              period: '/month',
              description: 'Perfect for small firms getting started',
              features: [
                'Up to 15 team members',
                'Unlimited engagements',
                'Client → Engagement → Task hierarchy',
                'Basic approval workflows',
                'QuickBooks Online sync',
                'Mobile app (iOS & Android)',
                'Email support',
              ],
              cta: 'Start Free Trial',
              highlighted: false,
            },
            {
              name: 'Professional',
              price: '$299',
              period: '/month',
              description: 'For growing firms with complex needs',
              features: [
                'Up to 50 team members',
                'Everything in Starter',
                '5-level hierarchy (Phase + Activity)',
                'Multi-level approvals with delegation',
                'Resource planning & capacity views',
                'Advanced analytics & reporting',
                'API access',
                'Priority support',
              ],
              cta: 'Start Free Trial',
              highlighted: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: '',
              description: 'For established firms requiring full control',
              features: [
                'Unlimited team members',
                'Everything in Professional',
                'SSO / SAML authentication',
                'Custom integrations',
                'Dedicated success manager',
                '99.9% SLA guarantee',
                'On-premise deployment option',
                '24/7 phone support',
              ],
              cta: 'Contact Sales',
              highlighted: false,
            },
          ].map((plan, i) => (
            <Card key={i} className={`${plan.highlighted ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200'}`}>
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.highlighted ? 'bg-blue-600 hover:bg-blue-700' : ''}`} variant={plan.highlighted ? 'default' : 'outline'}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                q: 'What happens if I exceed my team member limit?',
                a: 'We will notify you when you approach your limit. You can upgrade at any time without losing data.',
              },
              {
                q: 'Can I switch plans?',
                a: 'Yes, you can upgrade or downgrade at any time. Prorated charges apply.',
              },
              {
                q: 'Is there a long-term contract?',
                a: 'No, all plans are month-to-month. Annual billing offers a 20% discount.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards and ACH transfers for annual plans.',
              },
            ].map((faq, i) => (
              <div key={i}>
                <h4 className="font-semibold text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Templates Page
function TemplatesPage() {
  const templates = [
    {
      title: 'Annual Financial Statement Audit',
      description: 'Complete ISA/GAAS-compliant engagement structure for public and private company audits.',
      phases: ['Planning & Risk Assessment', 'Control Testing', 'Substantive Procedures', 'Conclusion & Reporting'],
      estimatedHours: 320,
      teamSize: '4-6',
    },
    {
      title: 'Quarterly Review Engagement',
      description: 'Streamlined structure for quarterly review procedures under ISRE standards.',
      phases: ['Planning', 'Inquiry & Analytics', 'Documentation', 'Reporting'],
      estimatedHours: 80,
      teamSize: '2-3',
    },
    {
      title: 'Internal Control Assessment',
      description: 'SOC 1 or SOC 2 engagement structure with control testing framework.',
      phases: ['Scoping', 'Control Design', 'Operating Effectiveness', 'Report Preparation'],
      estimatedHours: 240,
      teamSize: '3-5',
    },
    {
      title: 'Due Diligence',
      description: 'Financial due diligence for M&A transactions with quality of earnings focus.',
      phases: ['Kickoff & Data Request', 'Financial Analysis', 'Management Interviews', 'Report Drafting'],
      estimatedHours: 160,
      teamSize: '3-4',
    },
    {
      title: 'Agreed-Upon Procedures',
      description: 'AUP engagement for specific verification or reconciliation procedures.',
      phases: ['Terms Agreement', 'Procedure Execution', 'Finding Documentation', 'Report Issuance'],
      estimatedHours: 40,
      teamSize: '2',
    },
    {
      title: 'Tax Compliance',
      description: 'Corporate tax return preparation with documentation and review workflow.',
      phases: ['Data Collection', 'Preparation', 'Review', 'Filing'],
      estimatedHours: 60,
      teamSize: '2-3',
    },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-purple-100 text-purple-700 mb-4">Templates</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Pre-Built Engagement Templates
          </h1>
          <p className="text-lg text-slate-600">
            Start every engagement with proven structure. Industry-standard 
            methodologies, ready to customize.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, i) => (
            <Card key={i} className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="p-6">
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <p className="text-sm text-slate-500 mt-2">{template.description}</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Phases</p>
                    <div className="flex flex-wrap gap-2">
                      {template.phases.map((phase, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {phase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{template.estimatedHours} hrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{template.teamSize} people</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Use Template
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Need a Custom Template?</h3>
              <p className="text-slate-600">
                Professional and Enterprise plans include custom template creation 
                to match your firm methodology.
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'features':
        return <FeaturesPage />;
      case 'security':
        return <SecurityPage />;
      case 'pricing':
        return <PricingPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'planner':
        return <Planner />;
      default:
        return (
          <>
            <HeroSection setCurrentPage={setCurrentPage} />
            <PainPointsSection />
            <FeaturesSection />
            <PricingSection />
            <CTASection setCurrentPage={setCurrentPage} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {currentPage !== 'planner' && <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      <main>{renderPage()}</main>
      {currentPage !== 'planner' && <Footer setCurrentPage={setCurrentPage} />}
    </div>
  );
}

export default App;
