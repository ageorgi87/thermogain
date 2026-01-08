import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AnalyticsData } from "@/app/(tracking)/actions/getAnalytics"

interface TopUsersTableProps {
  data: AnalyticsData["topUsers"]
}

export const TopUsersTable = ({ data }: TopUsersTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Top 10 utilisateurs les plus actifs</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rang</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Total projets</TableHead>
              <TableHead className="text-right">Projets complétés</TableHead>
              <TableHead className="text-right">Taux complétion</TableHead>
              <TableHead className="text-right">Dernière activité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => {
              const completionRate =
                user.totalProjects > 0
                  ? ((user.completedProjects / user.totalProjects) * 100).toFixed(0)
                  : "0"

              return (
                <TableRow
                  key={user.email}
                  className={index === 0 ? "bg-yellow-50" : ""}
                >
                  <TableCell className="font-bold">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && `#${index + 1}`}
                  </TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {user.totalProjects}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {user.completedProjects}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        Number(completionRate) >= 80
                          ? "default"
                          : Number(completionRate) >= 50
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {completionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(user.lastActivity).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {data.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Aucun utilisateur actif pour le moment
        </p>
      )}
    </CardContent>
  </Card>
)
