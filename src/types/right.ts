export interface Right {
  id: number
  key: string
  title: string
  pagepermisson?: number
  routepermisson?: number
  grade?: number
  children?: Right[]
}
