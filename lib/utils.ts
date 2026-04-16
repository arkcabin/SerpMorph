import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGscDomain(domain: string) {
  if (!domain) return ""
  return domain.replace("sc-domain:", "")
}

export function isDomainProperty(domain: string) {
  return domain?.startsWith("sc-domain:")
}
