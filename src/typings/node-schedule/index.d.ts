import 'node-schedule'

type ScheduleSpec = Date | string | number | { rule: string; tz?: string }

declare module 'node-schedule' {
  interface Job {
    schedule(spec: ScheduleSpec): boolean
  }
}
