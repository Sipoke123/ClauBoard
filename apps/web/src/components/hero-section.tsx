'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon, Bars3Icon, XMarkIcon, RocketLaunchIcon, CommandLineIcon } from '@heroicons/react/24/outline'
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
                        <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
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
                                    <h1 className="mt-8 lg:mt-16 max-w-2xl text-balance text-5xl font-medium text-foreground md:text-6xl">
                                        One dashboard for all your{' '}
                                        <span className="text-emerald-600 dark:text-emerald-400">AI agents</span>
                                    </h1>
                                    <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-fg">
                                        Stop switching between terminals. Launch multiple <span className="font-semibold text-[#D97706]">Claude Code</span> agents,
                                        build pipelines, and watch everything happen live — tool calls, file changes,
                                        results — all on one screen.
                                    </p>
                                    <div className="mt-12 flex items-center gap-2">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base bg-transparent border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60">
                                            <Link href="/office" className="flex items-center gap-2">
                                                <RocketLaunchIcon className="w-4 h-4" />
                                                <span className="text-nowrap">Open Dashboard</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-[42px] rounded-xl px-5 text-base text-muted-fg hover:text-foreground hover:bg-foreground/5">
                                            <Link href="#getting-started" className="flex items-center gap-2">
                                                <CommandLineIcon className="w-4 h-4" />
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
                                    className="absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35% to-background"
                                />
                                <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border-base bg-card p-3 shadow-lg shadow-panel-shadow ring-1 ring-border-subtle">
                                    <div className="aspect-[15/8] relative rounded-xl bg-background border border-border-subtle overflow-hidden flex items-center justify-center">
                                        <div className="text-center space-y-3 px-8">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.8s' }} />
                                                <div className="w-3 h-3 rounded-full bg-muted-fg" />
                                            </div>
                                            <p className="text-muted-fg text-sm">6 agents active — open the dashboard to see them live</p>
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
                                className="block text-sm text-foreground/80 duration-150 hover:opacity-75">
                                <span>Try the live demo</span>
                                <ChevronRightIcon className="ml-1 inline-block w-3 h-3" />
                            </Link>
                        </div>
                        <div className="group-hover:blur-sm mx-auto mt-12 grid max-w-3xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-foreground">6</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-fg">Agent Roles</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-foreground">50k+</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-fg">Events / No Lag</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-foreground">RT</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-fg">Interactive</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">2</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-fg">Storage Backends</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Docs', href: '/docs' },
    { name: 'Get Started', href: '/#getting-started' },
]

export const HeroHeader = () => {
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
                className={cn('group fixed z-20 w-full border-b transition-colors duration-150', scrolled ? 'bg-nav-bg backdrop-blur-xl border-border-base' : 'border-transparent')}>
                <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center gap-2.5">
                                <img src="/logo.svg" alt="AgentFlow" className="w-6 h-6" />
                                <span className="text-sm font-semibold tracking-tight text-foreground">AgentFlow</span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Bars3Icon className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 text-muted-fg duration-200" />
                                <XMarkIcon className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 text-muted-fg opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-fg hover:text-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-card group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border-base p-6 shadow-2xl shadow-panel-shadow md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-fg hover:text-foreground block duration-150">
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
                                    className="border-border-base bg-transparent text-foreground/80 hover:bg-foreground/5 hover:text-foreground">
                                    <Link href="#getting-started">
                                        <span>Get Started</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-transparent border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60">
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
