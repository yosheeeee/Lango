import LocaleIcon from '@renderer/components/project/LocaleIcon'
import { Progress } from '@renderer/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { LocaleCoverage } from 'src/domain/models/analytics'

type Props = {
  rows: LocaleCoverage[]
  sourceLocale: string | null
}

export default function LocaleCoverageTable({ rows, sourceLocale }: Props) {
  if (rows.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-gray-200">Locale coverage</h3>
      <div className="rounded-md border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">Locale</TableHead>
              <TableHead className="w-[15%] text-right">Present</TableHead>
              <TableHead className="w-[15%] text-right">Missing</TableHead>
              <TableHead className="w-[15%] text-right">Empty</TableHead>
              <TableHead>Coverage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.locale}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <LocaleIcon locale={r.locale} className="size-4" />
                    <span className="font-medium">{r.locale}</span>
                    {sourceLocale === r.locale && (
                      <span className="text-[10px] uppercase text-cyan-400 font-semibold">
                        source
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.presentKeys}/{r.totalKeys}
                </TableCell>
                <TableCell className="text-right tabular-nums text-orange-300">
                  {r.missingKeys > 0 ? r.missingKeys : '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums text-amber-300">
                  {r.emptyValues > 0 ? r.emptyValues : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={r.coveragePercent} className="flex-1" />
                    <span className="w-14 text-right text-xs tabular-nums text-gray-300">
                      {r.coveragePercent.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
