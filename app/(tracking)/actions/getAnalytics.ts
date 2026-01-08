"use server"

import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

/**
 * Type pour les statistiques d'analytics
 */
export interface AnalyticsData {
  // Vue d'ensemble
  overview: {
    totalProjects: number
    projectsThisMonth: number
    completionRate: number
    registeredUsers: number
    anonymousProjects: number
  }

  // Funnel d'abandon
  funnelData: Array<{
    step: number
    stepName: string
    count: number
    dropoffRate: number
    conversionFromStart: number
  }>

  // Engagement utilisateur
  engagement: {
    avgProjectsPerUser: number
    avgCompletedPerActiveUser: number
    activeUsersThisMonth: number
  }

  // Évolution temporelle
  monthlyData: Array<{
    month: string
    projectsCreated: number
    completionRate: number
  }>

  // Top utilisateurs
  topUsers: Array<{
    email: string
    totalProjects: number
    completedProjects: number
    lastActivity: Date
  }>
}

/**
 * Vérifie l'authentification HTTP Basic
 */
const checkAuth = async (): Promise<boolean> => {
  const headersList = await headers()
  const authorization = headersList.get("authorization")

  if (!authorization?.startsWith("Basic ")) {
    return false
  }

  const base64Credentials = authorization.split(" ")[1]
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8")
  const [username, password] = credentials.split(":")

  return username === "bayroyd" && password === "Julierie1!"
}

/**
 * Récupère toutes les analytics de ThermoGain
 * Protégé par HTTP Basic Authentication
 */
export const getAnalytics = async (): Promise<AnalyticsData | { error: string }> => {
  // Vérification de l'authentification
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    return { error: "Unauthorized" }
  }

  try {
    // 1. Vue d'ensemble
    const totalProjects = await prisma.project.count()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const projectsThisMonth = await prisma.project.count({
      where: { createdAt: { gte: startOfMonth } }
    })

    const completedProjects = await prisma.project.count({
      where: { completed: true }
    })
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0

    const registeredUsers = await prisma.user.count()

    const projectsWithUser = await prisma.project.count({
      where: { userId: { not: null } }
    })
    const anonymousProjects = totalProjects - projectsWithUser

    // 2. Funnel d'abandon
    const stepNames = [
      "Informations",
      "Logement",
      "Chauffage actuel",
      "Système ECS actuel",
      "Projet PAC",
      "Coûts",
      "Aides",
      "Financement"
    ]

    const funnelData = await Promise.all(
      [1, 2, 3, 4, 5, 6, 7, 8].map(async (step) => {
        const count = await prisma.project.count({
          where: { currentStep: { gte: step } }
        })

        const prevCount = step > 1
          ? await prisma.project.count({ where: { currentStep: { gte: step - 1 } } })
          : totalProjects

        const dropoffRate = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0
        const conversionFromStart = totalProjects > 0 ? (count / totalProjects) * 100 : 0

        return {
          step,
          stepName: stepNames[step - 1],
          count,
          dropoffRate,
          conversionFromStart
        }
      })
    )

    // 3. Engagement utilisateur
    const usersWithProjects = await prisma.user.findMany({
      select: {
        _count: {
          select: { projects: true }
        },
        projects: {
          where: { completed: true },
          select: { id: true }
        }
      },
      where: {
        projects: { some: {} }
      }
    })

    const totalProjectsFromUsers = usersWithProjects.reduce((sum, u) => sum + u._count.projects, 0)
    const avgProjectsPerUser = usersWithProjects.length > 0
      ? totalProjectsFromUsers / usersWithProjects.length
      : 0

    const totalCompletedFromActiveUsers = usersWithProjects.reduce(
      (sum, u) => sum + u.projects.length,
      0
    )
    const avgCompletedPerActiveUser = usersWithProjects.length > 0
      ? totalCompletedFromActiveUsers / usersWithProjects.length
      : 0

    const activeUsersThisMonth = await prisma.user.count({
      where: {
        projects: {
          some: {
            createdAt: { gte: startOfMonth }
          }
        }
      }
    })

    // 4. Évolution temporelle (6 derniers mois)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const projectsCreated = await prisma.project.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      })

      const completedInMonth = await prisma.project.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
          completed: true
        }
      })

      const monthCompletionRate = projectsCreated > 0
        ? (completedInMonth / projectsCreated) * 100
        : 0

      monthlyData.push({
        month: monthStart.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' }),
        projectsCreated,
        completionRate: monthCompletionRate
      })
    }

    // 5. Top 10 utilisateurs
    const topUsers = await prisma.user.findMany({
      select: {
        email: true,
        projects: {
          select: {
            id: true,
            completed: true,
            createdAt: true
          }
        }
      },
      where: {
        projects: { some: {} }
      },
      orderBy: {
        projects: { _count: 'desc' }
      },
      take: 10
    })

    const formattedTopUsers = topUsers.map(user => ({
      email: user.email,
      totalProjects: user.projects.length,
      completedProjects: user.projects.filter(p => p.completed).length,
      lastActivity: user.projects.length > 0
        ? user.projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : new Date()
    }))

    return {
      overview: {
        totalProjects,
        projectsThisMonth,
        completionRate: Math.round(completionRate * 10) / 10,
        registeredUsers,
        anonymousProjects
      },
      funnelData,
      engagement: {
        avgProjectsPerUser: Math.round(avgProjectsPerUser * 10) / 10,
        avgCompletedPerActiveUser: Math.round(avgCompletedPerActiveUser * 10) / 10,
        activeUsersThisMonth
      },
      monthlyData,
      topUsers: formattedTopUsers
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return { error: "Failed to fetch analytics data" }
  }
}
