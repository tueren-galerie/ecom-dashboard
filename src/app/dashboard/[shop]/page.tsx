import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ shop: string }>
}

export default async function DashboardHome({ params }: Props) {
  const { shop } = await params
  redirect(`/dashboard/${shop}/overview`)
}
