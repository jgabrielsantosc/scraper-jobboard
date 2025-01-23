'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const integrations = [
  {
    name: "Airtable",
    description: "Sincronize dados do Airtable automaticamente",
    icon: "/airtable-logo.png",
    href: "/integrations/airtable",
    status: "beta"
  },
  // Adicione mais integrações aqui
]

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrações</h1>
          <p className="text-muted-foreground">
            Conecte-se com outras plataformas para sincronizar seus dados
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Link 
            key={integration.name} 
            href={integration.href}
            className="block transition-transform hover:scale-[1.02]"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={integration.icon}
                        alt={`${integration.name} logo`}
                        width={32}
                        height={32}
                        style={{ width: 32, height: 32 }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{integration.name}</CardTitle>
                      {integration.status === 'beta' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Beta
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{integration.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 