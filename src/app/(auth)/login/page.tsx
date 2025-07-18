import { NextPage } from 'next'
import React from 'react'
import NextImage from 'next/image'
import { redirect } from 'next/navigation'
import { LoginPageForm } from '@/features/auth/components/LoginPageForm'
import { apiGet } from '@/features/service/api'
import { getAdminToken } from '@/shared/utils/helpers/cookieHelper'
import { ShoppingCart, Users, Package, BarChart3, CreditCard, TrendingUp, Shield, Settings, Zap, Globe, Truck } from 'lucide-react'
import ppi_logo from "../../../assets/logo/logo.png"

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>
}

const LoginPage: NextPage<LoginPageProps> = async ({ searchParams }) => {
  const { redirect: redirectPath } = await searchParams

  // if (getAdminToken()) {
  //   const r = await apiGet('/Admin/User/IsAuthorized', undefined, {
  //     validateStatus: status => status === 200 || status === 400 || status === 401 || status === 403,
  //   })

  //   if (r.status === 200)
  //     redirect(redirectPath as string || '/dashboard')
  // }

  const adminIcons = [
    { icon: ShoppingCart, color: 'text-blue-400' },
    { icon: Users, color: 'text-green-400' },
    { icon: Package, color: 'text-purple-400' },
    { icon: BarChart3, color: 'text-orange-400' },
    { icon: CreditCard, color: 'text-indigo-400' },
    { icon: TrendingUp, color: 'text-emerald-400' },
    { icon: Shield, color: 'text-red-400' },
    { icon: Settings, color: 'text-gray-400' },
    { icon: Zap, color: 'text-yellow-400' },
    { icon: Globe, color: 'text-cyan-400' },
    { icon: Truck, color: 'text-pink-400' },
  ]

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Panel - 70% on desktop, full width on mobile */}
          <div className="flex-none lg:flex-[7] h-64 lg:h-auto bg-gradient-to-br from-slate-400 via-blue-900 to-indigo-900 relative overflow-hidden">            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.4),transparent_50%)] animate-pulse"></div>
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.4),transparent_50%)] animate-pulse [animation-delay:1s]"></div>
              <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.4),transparent_50%)] animate-pulse [animation-delay:2s]"></div>
            </div>
            
            <div className="relative z-10 flex flex-col justify-center items-center h-full p-4 lg:p-8">
              {/* Logo Section */}
              <div className="text-center mb-6 lg:mb-12">
                <div className="flex items-center justify-center mb-3 lg:mb-6">
                  <a
                    href="https://www.promotionalproductinc.com"
                    className="bg-white/15 backdrop-blur-sm p-3 lg:p-6 rounded-2xl border border-white/30 shadow-2xl hover:bg-white/20 transition-all duration-300"
                  >
                    <NextImage
                      src={ppi_logo}
                      alt="Promotional Product Inc"
                      className="object-contain"
                      width={200}
                      height={200 * 239 / 1270}
                    />
                  </a>
                </div>
                <h1 className="text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-2">Promotional Product Inc</h1>
                <p className="text-sm lg:text-xl text-orange-100">Admin Portal</p>
              </div>

              {/* Vector Icons Display */}
              <div className="w-full max-w-2xl">
                {/* Desktop: Circular arrangement */}
                <div className="hidden lg:block relative">
                  <div className="relative w-80 h-80 mx-auto">
                    {adminIcons.map((item, index) => {
                      const angle = (index * 360) / adminIcons.length;
                      const radius = 120;
                      const x = Math.cos((angle * Math.PI) / 180) * radius;
                      const y = Math.sin((angle * Math.PI) / 180) * radius;
                      
                      return (
                        <div
                          key={index}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 group-hover:shadow-2xl animate-bounce"
                            style={{animationDelay: `${index * 100}ms`, animationDuration: '2s', animationIterationCount: 'infinite'}}>
                            <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Center decoration */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile: Grid arrangement */}
                <div className="lg:hidden grid grid-cols-6 gap-3 justify-items-center max-w-sm mx-auto">
                  {adminIcons.slice(0, 12).map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm p-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-bounce"
                      style={{ animationDelay: `${index * 50}ms`, animationDuration: '2s', animationIterationCount: 'infinite' }}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Tags - Hidden on mobile */}
              <div className="hidden lg:block mt-8 text-center">
                <div className="flex flex-wrap justify-center gap-3 text-orange-100">
                  <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">Product Management</span>
                  <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">Order Processing</span>
                  <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">Staff Analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - 30% on desktop, full width on mobile */}
          <div className="flex-1 lg:flex-[3] bg-gray-50 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden">
              <div className="text-center pb-6 lg:pb-8 pt-6 lg:pt-8 px-4 lg:px-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Login</h2>
              </div>
              <div className="px-4 lg:px-6 pb-6 lg:pb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                  <LoginPageForm
                    redirect={redirectPath as string}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <footer className="bg-white border-t border-gray-200 py-4 lg:py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-600 text-xs lg:text-sm">
                © 2025 Promotional Product Inc. All rights reserved.
              </p>
              <div className="flex justify-center space-x-4 mt-2 text-xs lg:text-sm text-gray-500">
                <a href="https://www.promotionalproductinc.com" className="hover:text-gray-700 transition-colors">Company Website</a>
                <span>•</span>
                <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer> */}
      </div>


    </>
  )
}

export default LoginPage