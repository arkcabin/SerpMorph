"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title} 
                  isActive={item.isActive}
                  className="h-8 py-0 px-2.5 gap-2.5 hover:bg-primary/5 data-[active=true]:bg-primary/10 transition-colors"
                >
                  <a href={item.url}>
                    <div className="flex size-4 items-center justify-center text-muted-foreground/80 group-data-[active=true]:text-primary transition-colors">
                        {item.icon}
                    </div>
                    <span className="text-xs font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    isActive={item.isActive}
                    className="h-8 py-0 px-2.5 gap-2.5 hover:bg-primary/5 data-[active=true]:bg-primary/10 transition-colors"
                  >
                    <div className="flex size-4 items-center justify-center text-muted-foreground/80 group-data-[active=true]:text-primary transition-colors">
                        {item.icon}
                    </div>
                    <span className="text-xs font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.title}
                    </span>
                    <ChevronRightIcon className="ms-auto size-3.5 text-muted-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l border-border/40 py-0.5 mt-0.5 space-y-0.5">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                            asChild 
                            isActive={subItem.isActive}
                            className="h-7 py-0 px-2 hover:bg-primary/5 data-[active=true]:bg-primary/10 transition-colors"
                        >
                          <a href={subItem.url}>
                            <span className="text-[11px] font-medium tracking-tight text-muted-foreground/80 data-[active=true]:text-primary">
                                {subItem.title}
                            </span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
