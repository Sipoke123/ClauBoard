'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon, Bars3Icon, XMarkIcon, RocketLaunchIcon, CommandLineIcon } from '@heroicons/react/24/outline'
import { Button } from './ui/button'
import { AnimatedGroup } from './ui/animated-group'
import { cn } from '../lib/cn'
import { ThemeToggle } from './ui/theme-toggle'

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
                type: 'spring' as const,
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
                                        Stop switching between terminals. Launch multiple <span className="font-medium">Claude Code</span> agents,
                                        build pipelines, and watch everything happen live — tool calls, file changes,
                                        results — all on one screen. <span className="font-medium text-foreground">Free and open-source.</span>
                                    </p>
                                    <div className="mt-12 flex items-center gap-2">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base bg-card border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-surface hover:border-emerald-500/60">
                                            <Link href="/office" className="flex items-center gap-2">
                                                <RocketLaunchIcon className="w-4 h-4" />
                                                <span className="text-nowrap">Try it Now</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-[42px] rounded-xl px-5 text-base text-muted-fg hover:text-foreground hover:bg-foreground/5">
                                            <Link href="#getting-started" className="flex items-center gap-2">
                                                <CommandLineIcon className="w-4 h-4" />
                                                <span className="text-nowrap">Get Started</span>
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
                                    <img src="/dark.png" alt="ClauBoard dashboard" className="w-full rounded-xl hidden dark:block" />
                                    <img src="/light.png" alt="ClauBoard dashboard" className="w-full rounded-xl dark:hidden" />
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
                                <span className="text-3xl font-bold text-foreground">15</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-fg">Event Types</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-foreground">50k+</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-fg">Events / No Lag</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-foreground">Live</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-fg">WebSocket</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Docker</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-fg">Ready</span>
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
    { name: 'Docs', href: '/docs' },
    { name: 'Community', href: 'https://github.com/Sipoke123/ClauBoard', external: true },
    { name: 'Get Started', href: '/#getting-started' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn('group fixed z-20 w-full border-b transition-all duration-300', scrolled ? 'bg-nav-bg backdrop-blur-xl border-border-base' : 'border-transparent')}>
                <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center gap-1">
                                <img src="/logo.svg" alt="ClauBoard" className="w-6 h-6" />
                                <span className="text-sm font-semibold tracking-tight text-foreground">ClauBoard</span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Bars3Icon className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 text-muted-fg duration-200" />
                                <XMarkIcon className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 text-muted-fg opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="hidden lg:flex items-center gap-8">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                            className="text-muted-fg hover:text-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ThemeToggle className="scale-75" />
                        </div>

                        <div className="bg-card group-data-[state=active]:block mb-6 hidden w-full rounded-3xl border border-border-base p-6 shadow-2xl shadow-panel-shadow lg:hidden">
                            <ul className="space-y-6 text-base">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                            className="text-muted-fg hover:text-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 flex justify-center">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
