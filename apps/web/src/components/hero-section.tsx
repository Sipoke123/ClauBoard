'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Menu, X, Rocket, Terminal } from 'lucide-react'
import { Button } from './ui/button'
import { AnimatedGroup } from './ui/animated-group'
import { cn } from '../lib/cn'
import { useScroll } from 'motion/react'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-24">
                        <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,#09090b_75%)]"></div>
                        <div className="mx-auto max-w-5xl px-6">
                            <div className="sm:mx-auto lg:mr-auto">
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                >
                                    <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium text-zinc-50 md:text-6xl lg:mt-16">
                                        Visual control plane for{' '}
                                        <span className="text-blue-400">AI agents</span>
                                    </h1>
                                    <p className="mt-8 max-w-2xl text-pretty text-lg text-zinc-400">
                                        Launch, monitor, and coordinate multiple AI agents from a single operator surface.
                                        Replace terminal-hopping with a live office view of every agent, tool call, and file change.
                                    </p>
                                    <div className="mt-12 flex items-center gap-2">
                                        <div className="bg-white/5 rounded-[14px] border border-white/10 p-0.5">
                                            <Button
                                                asChild
                                                size="lg"
                                                className="rounded-xl px-5 text-base bg-blue-600 text-white hover:bg-blue-500">
                                                <Link href="/office">
                                                    <Rocket size={16} className="mr-2" />
                                                    <span className="text-nowrap">Open Dashboard</span>
                                                </Link>
                                            </Button>
                                        </div>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-[42px] rounded-xl px-5 text-base text-zinc-400 hover:text-zinc-100 hover:bg-white/5">
                                            <Link href="#getting-started">
                                                <Terminal size={16} className="mr-2" />
                                                <span className="text-nowrap">Quick Start</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35% to-zinc-950"
                                />
                                <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-3 shadow-lg shadow-zinc-950/50 ring-1 ring-white/5">
                                    <div className="aspect-[15/8] relative rounded-xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center">
                                        <div className="text-center space-y-3 px-8">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.8s' }} />
                                                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                                            </div>
                                            <p className="text-zinc-500 text-sm">6 agents active — open the dashboard to see them live</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/office"
                                className="block text-sm text-zinc-300 duration-150 hover:opacity-75">
                                <span>Try the live demo</span>
                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        <div className="group-hover:blur-sm mx-auto mt-12 grid max-w-3xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-zinc-100">6</span>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Mock Agents</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-zinc-100">15</span>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Event Types</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-zinc-100">RT</span>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500">WebSocket</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-blue-400">4</span>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Pipeline Presets</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'Get Started', href: '#getting-started' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    const { scrollYProgress } = useScroll()

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrolled(latest > 0.05)
        })
        return () => unsubscribe()
    }, [scrollYProgress])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn('group fixed z-20 w-full border-b border-white/[0.06] transition-colors duration-150', scrolled && 'bg-zinc-950/80 backdrop-blur-xl')}>
                <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                                </div>
                                <span className="text-sm font-semibold tracking-tight text-zinc-100">AgentFlow</span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 text-zinc-400 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 text-zinc-400 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-zinc-500 hover:text-zinc-100 block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-zinc-900 group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-white/[0.06] p-6 shadow-2xl shadow-zinc-950/50 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-zinc-500 hover:text-zinc-100 block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-zinc-100">
                                    <Link href="#getting-started">
                                        <span>Get Started</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-blue-600 text-white hover:bg-blue-500">
                                    <Link href="/office">
                                        <span>Dashboard</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
